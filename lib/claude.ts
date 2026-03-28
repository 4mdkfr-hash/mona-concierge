import Anthropic from "@anthropic-ai/sdk";

export const claude = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY,
});

export const CLAUDE_MODEL = "claude-sonnet-4-6";

export async function generateReply({
  systemPrompt,
  messages,
  maxTokens = 500,
}: {
  systemPrompt: string;
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  maxTokens?: number;
}): Promise<{ text: string; promptTokens: number; completionTokens: number }> {
  const response = await claude.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: maxTokens,
    system: systemPrompt,
    messages,
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";

  return {
    text,
    promptTokens: response.usage.input_tokens,
    completionTokens: response.usage.output_tokens,
  };
}

// Approximate cost in EUR (claude-sonnet-4-6 pricing)
export function estimateCostEur(
  promptTokens: number,
  completionTokens: number
): number {
  const inputCostUsd = (promptTokens / 1_000_000) * 3.0;
  const outputCostUsd = (completionTokens / 1_000_000) * 15.0;
  const totalUsd = inputCostUsd + outputCostUsd;
  return totalUsd * 0.92; // approximate USD→EUR
}
