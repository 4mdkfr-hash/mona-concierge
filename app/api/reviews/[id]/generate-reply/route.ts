import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { generateReviewReply, detectReviewLanguage } from "@/lib/google-reviews";
import { estimateCostEur, CLAUDE_MODEL } from "@/lib/claude";

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createServiceClient();

  const { data: review } = await supabase
    .from("google_reviews")
    .select("*, venues(name, type, tone_brief, languages)")
    .eq("id", params.id)
    .single();

  if (!review) {
    return NextResponse.json({ error: "Review not found" }, { status: 404 });
  }

  const venue = review.venues as {
    name: string;
    type: string;
    tone_brief: string | null;
    languages: string[];
  };

  const reviewContent = review.content ?? "";
  const primaryLang = (venue.languages as string[])[0] ?? "en";
  const language = reviewContent.trim()
    ? await detectReviewLanguage(reviewContent)
    : primaryLang;

  const { replyText, sentiment, promptTokens, completionTokens } =
    await generateReviewReply({
      venueName: venue.name,
      venueType: venue.type,
      toneBrief: venue.tone_brief,
      reviewContent,
      authorName: review.author_name,
      rating: review.rating,
      language,
    });

  const now = new Date().toISOString();

  await supabase
    .from("google_reviews")
    .update({ reply_text: replyText, replied_at: now, sentiment })
    .eq("id", params.id);

  // Email alert for negative reviews (1-2★)
  if (review.rating <= 2) {
    try {
      const { data: venueEmail } = await supabase
        .from("venues")
        .select("owner_email, email_notifications_enabled, email_notify_negative_reviews")
        .eq("id", review.venue_id)
        .single();

      if (venueEmail?.owner_email && venueEmail.email_notifications_enabled && venueEmail.email_notify_negative_reviews) {
        const { sendNegativeReviewAlert } = await import("@/lib/email");
        await sendNegativeReviewAlert({
          ownerEmail: venueEmail.owner_email,
          venueName: venue.name,
          authorName: review.author_name ?? "Anonymous",
          rating: review.rating,
          reviewText: reviewContent,
        });
      }
    } catch (err) {
      console.error("Email negative review alert error:", err);
    }
  }

  const costEur = estimateCostEur(promptTokens, completionTokens);
  await supabase.from("ai_usage_logs").insert({
    venue_id: review.venue_id,
    model: CLAUDE_MODEL,
    prompt_tokens: promptTokens,
    completion_tokens: completionTokens,
    cost_eur: costEur,
  });

  return NextResponse.json({ replyText, sentiment, language });
}
