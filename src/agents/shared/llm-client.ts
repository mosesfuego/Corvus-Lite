export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type ChatJsonRequest = {
  messages: ChatMessage[];
  maxTokens?: number;
  temperature?: number;
};

export async function callKimiJson({
  messages,
  maxTokens = 1200,
  temperature = 0.1,
}: ChatJsonRequest) {
  const apiKey = process.env.KIMI_API_KEY;
  const baseUrl = process.env.KIMI_BASE_URL || "https://integrate.api.nvidia.com/v1";
  const model = process.env.KIMI_MODEL || "moonshotai/kimi-k2.6";

  if (!apiKey) {
    throw new Error("Missing KIMI_API_KEY.");
  }

  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      extra_body:
        process.env.KIMI_PROVIDER === "nvidia_nim"
          ? { chat_template_kwargs: { thinking: false } }
          : undefined,
    }),
  });

  const rawText = await response.text();

  if (!response.ok) {
    throw new Error(`Kimi call failed with status ${response.status}: ${rawText}`);
  }

  const payload = JSON.parse(rawText) as {
    choices?: Array<{
      message?: {
        content?: string;
        reasoning_content?: string;
      };
    }>;
  };

  const content =
    payload.choices?.[0]?.message?.content ||
    payload.choices?.[0]?.message?.reasoning_content ||
    "";

  if (!content.trim()) {
    throw new Error("Kimi returned an empty response.");
  }

  return content;
}

export function parseJsonObject<T>(content: string): T {
  const trimmed = content.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced?.[1] ?? trimmed;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    throw new Error("LLM response did not contain a JSON object.");
  }

  return JSON.parse(candidate.slice(start, end + 1)) as T;
}
