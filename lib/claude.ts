export const CLAUDE_MODEL = "claude-haiku-4-5-20251001";

export async function generateReply({
  systemPrompt,
  messages,
  maxTokens = 500,
}: {
  systemPrompt: string;
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  maxTokens?: number;
}): Promise<{ text: string; promptTokens: number; completionTokens: number }> {
  const apiKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey ?? "",
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Anthropic API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  const text =
    data.content[0]?.type === "text" ? data.content[0].text : "";

  return {
    text,
    promptTokens: data.usage.input_tokens,
    completionTokens: data.usage.output_tokens,
  };
}

// Approximate cost in EUR (claude-haiku pricing)
export function estimateCostEur(
  promptTokens: number,
  completionTokens: number
): number {
  const inputCostUsd = (promptTokens / 1_000_000) * 0.25;
  const outputCostUsd = (completionTokens / 1_000_000) * 1.25;
  const totalUsd = inputCostUsd + outputCostUsd;
  return totalUsd * 0.92; // approximate USD→EUR
}
