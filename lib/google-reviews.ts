import { claude, CLAUDE_MODEL, estimateCostEur } from "./claude";

export type Sentiment = "positive" | "neutral" | "negative";

export function classifySentimentByRating(rating: number): Sentiment {
  if (rating >= 4) return "positive";
  if (rating === 3) return "neutral";
  return "negative";
}

function buildSystemPrompt(
  venueName: string,
  venueType: string,
  toneBrief: string | null,
  sentiment: Sentiment,
  language: string
): string {
  const toneNote = toneBrief
    ? `Venue tone: ${toneBrief}`
    : "Be warm, professional, and sincere.";

  const sentimentInstruction = {
    positive:
      "The review is positive. Thank the reviewer warmly, mention something specific if possible, and invite them to come back.",
    neutral:
      "The review is neutral. Acknowledge their experience, thank them for the feedback, and ask what you can improve.",
    negative:
      "The review is negative. Apologize sincerely, acknowledge the issue, and offer a resolution or invite them to contact you directly.",
  }[sentiment];

  return `You are writing a reply to a Google Review on behalf of ${venueName}, a ${venueType} in Monaco.
${toneNote}
${sentimentInstruction}
Reply in the same language as the review. The detected language is: ${language}.
Keep the reply concise (under 120 words). Do not use generic templates — make it feel personal.
Do not include a greeting salutation like "Dear [name]" — go straight into the reply.
Sign off with the ${venueName} team.`;
}

export async function generateReviewReply({
  venueName,
  venueType,
  toneBrief,
  reviewContent,
  authorName,
  rating,
  language,
}: {
  venueName: string;
  venueType: string;
  toneBrief: string | null;
  reviewContent: string;
  authorName: string | null;
  rating: number;
  language: string;
}): Promise<{
  replyText: string;
  sentiment: Sentiment;
  promptTokens: number;
  completionTokens: number;
}> {
  const sentiment = classifySentimentByRating(rating);

  const systemPrompt = buildSystemPrompt(
    venueName,
    venueType,
    toneBrief,
    sentiment,
    language
  );

  const userMessage = authorName
    ? `Review by ${authorName} (${rating}/5 stars):\n${reviewContent}`
    : `Review (${rating}/5 stars):\n${reviewContent}`;

  const response = await claude.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 250,
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  });

  const replyText =
    response.content[0].type === "text" ? response.content[0].text.trim() : "";

  return {
    replyText,
    sentiment,
    promptTokens: response.usage.input_tokens,
    completionTokens: response.usage.output_tokens,
  };
}

export async function detectReviewLanguage(text: string): Promise<string> {
  const response = await claude.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 10,
    system:
      "Detect the language of the text. Reply with only the ISO 639-1 language code (e.g. en, fr, ru). Nothing else.",
    messages: [{ role: "user", content: text }],
  });

  const lang =
    response.content[0].type === "text"
      ? response.content[0].text.trim().toLowerCase().slice(0, 5)
      : "en";

  return lang || "en";
}

export async function postReviewReply({
  accessToken,
  accountId,
  locationId,
  reviewId,
  replyText,
}: {
  accessToken: string;
  accountId: string;
  locationId: string;
  reviewId: string;
  replyText: string;
}): Promise<void> {
  const url = `https://mybusiness.googleapis.com/v4/accounts/${accountId}/locations/${locationId}/reviews/${reviewId}/reply`;

  const res = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ comment: replyText }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Google API reply failed (${res.status}): ${err}`);
  }
}

export { estimateCostEur, CLAUDE_MODEL };
