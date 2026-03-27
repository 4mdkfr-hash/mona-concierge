import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import {
  generateReviewReply,
  detectReviewLanguage,
  postReviewReply,
  estimateCostEur,
  CLAUDE_MODEL,
} from "@/lib/google-reviews";

interface GoogleReviewPayload {
  venueId: string;
  reviewId: string;
  authorName?: string | null;
  rating: number;
  content?: string | null;
  // Google Business API OAuth token for posting the reply
  accessToken?: string;
  accountId?: string;
  locationId?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: GoogleReviewPayload = await req.json();
    const {
      venueId,
      reviewId,
      authorName = null,
      rating,
      content,
      accessToken,
      accountId,
      locationId,
    } = body;

    if (!venueId || !reviewId || rating == null) {
      return NextResponse.json(
        { error: "venueId, reviewId, and rating are required" },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // Check for duplicate — skip if already processed
    const { data: existing } = await supabase
      .from("google_reviews")
      .select("id, replied_at")
      .eq("venue_id", venueId)
      .eq("review_id", reviewId)
      .single();

    if (existing?.replied_at) {
      return NextResponse.json({ status: "already_replied", reviewId });
    }

    // Load venue config
    const { data: venue } = await supabase
      .from("venues")
      .select("name, type, tone_brief, languages")
      .eq("id", venueId)
      .single();

    if (!venue) {
      return NextResponse.json({ error: "Venue not found" }, { status: 404 });
    }

    const reviewContent = content || "";

    // Detect language (fallback to venue primary language)
    const primaryLang = (venue.languages as string[])[0] ?? "en";
    const language = reviewContent.trim()
      ? await detectReviewLanguage(reviewContent)
      : primaryLang;

    // Generate AI reply with sentiment-based template
    const { replyText, sentiment, promptTokens, completionTokens } =
      await generateReviewReply({
        venueName: venue.name,
        venueType: venue.type,
        toneBrief: venue.tone_brief,
        reviewContent,
        authorName,
        rating,
        language,
      });

    const now = new Date().toISOString();

    // Upsert review + reply into DB
    if (existing) {
      await supabase
        .from("google_reviews")
        .update({
          author_name: authorName,
          rating,
          content: reviewContent || null,
          reply_text: replyText,
          replied_at: now,
          sentiment,
        })
        .eq("id", existing.id);
    } else {
      await supabase.from("google_reviews").insert({
        venue_id: venueId,
        review_id: reviewId,
        author_name: authorName,
        rating,
        content: reviewContent || null,
        reply_text: replyText,
        replied_at: now,
        sentiment,
      });
    }

    // Log AI usage
    const costEur = estimateCostEur(promptTokens, completionTokens);
    await supabase.from("ai_usage_logs").insert({
      venue_id: venueId,
      model: CLAUDE_MODEL,
      prompt_tokens: promptTokens,
      completion_tokens: completionTokens,
      cost_eur: costEur,
    });

    // Post reply to Google if credentials provided
    let googlePosted = false;
    if (accessToken && accountId && locationId) {
      try {
        await postReviewReply({
          accessToken,
          accountId,
          locationId,
          reviewId,
          replyText,
        });
        googlePosted = true;
      } catch (err) {
        console.error("Failed to post reply to Google:", err);
        // Don't fail the whole request — reply is saved in DB
      }
    }

    return NextResponse.json({
      status: "ok",
      reviewId,
      sentiment,
      language,
      replyText,
      googlePosted,
    });
  } catch (err) {
    console.error("Google reviews webhook error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
