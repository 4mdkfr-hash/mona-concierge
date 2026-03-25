import { NextRequest, NextResponse } from "next/server";
import { generateReply } from "@/lib/claude";

type Language = "fr" | "en" | "ru" | "unknown";

// Simple heuristic: check for common words/characters before calling Claude
function heuristicDetect(text: string): Language | null {
  const t = text.toLowerCase();

  // Cyrillic characters → Russian
  if (/[\u0400-\u04FF]/.test(text)) return "ru";

  // Common French words
  if (/\b(bonjour|merci|bonsoir|s'il vous|je voudrais|réservation|table)\b/.test(t))
    return "fr";

  // Common English words
  if (/\b(hello|hi|thanks|thank you|please|book|reservation|table)\b/.test(t))
    return "en";

  return null;
}

export async function POST(req: NextRequest) {
  const { text } = await req.json();

  if (!text || typeof text !== "string") {
    return NextResponse.json({ error: "text required" }, { status: 400 });
  }

  // Try heuristic first
  const heuristic = heuristicDetect(text);
  if (heuristic) {
    return NextResponse.json({ language: heuristic, method: "heuristic" });
  }

  // Fallback to Claude for ambiguous text
  try {
    const { text: result } = await generateReply({
      systemPrompt:
        'You are a language detector. Respond with only one word: "fr", "en", "ru", or "unknown". No punctuation, no explanation.',
      messages: [{ role: "user", content: `Detect the language: "${text}"` }],
      maxTokens: 10,
    });

    const lang = result.trim().toLowerCase() as Language;
    const valid: Language[] = ["fr", "en", "ru", "unknown"];
    const language: Language = valid.includes(lang) ? lang : "unknown";

    return NextResponse.json({ language, method: "claude" });
  } catch {
    return NextResponse.json({ language: "unknown", method: "error" });
  }
}
