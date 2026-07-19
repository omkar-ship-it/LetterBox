/** OpenAI-compatible chat completion via OpenRouter — confirmed against
 * their live API. `anthropic/claude-sonnet-5` is a real, current model slug
 * (checked against OpenRouter's own /api/v1/models list, not guessed). */
const OPENROUTER_MODEL = "anthropic/claude-sonnet-5";

/** Sends a single-turn prompt and returns the raw text response, or null if
 * no API key is configured or the request fails — callers fall back to a
 * mocked draft in either case, same as the previous direct-Anthropic setup. */
export async function composeWithAI(prompt: string, maxTokens: number): Promise<string | null> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        max_tokens: maxTokens,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!res.ok) {
      console.error("[ai] OpenRouter request failed", res.status, await res.text().catch(() => ""));
      return null;
    }

    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content;
    return typeof text === "string" ? text.trim() : null;
  } catch (err) {
    console.error("[ai] OpenRouter request threw", err);
    return null;
  }
}
