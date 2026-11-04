import { huginSystemPrompt, parseContext } from "@/lib/hugin";
import { gemini, huginError, isRetryable, MODELS, notConfigured } from "@/lib/server/gemini";
import { rateLimit } from "@/lib/server/rate-limit";

const MAX_MESSAGES = 20;
const MAX_MESSAGE_CHARS = 2000;

type ChatMessage = { role: "user" | "hugin"; text: string };

function parseMessages(raw: unknown): ChatMessage[] | null {
  if (!Array.isArray(raw) || raw.length === 0) return null;
  const messages = raw.slice(-MAX_MESSAGES).flatMap((m): ChatMessage[] => {
    if (!m || typeof m !== "object") return [];
    const { role, text } = m as Record<string, unknown>;
    if ((role !== "user" && role !== "hugin") || typeof text !== "string" || !text.trim()) return [];
    return [{ role, text: text.slice(0, MAX_MESSAGE_CHARS) }];
  });
  return messages.at(-1)?.role === "user" ? messages : null;
}

/** POST { messages, context } → streamed plain text, Hugin's reply. */
export async function POST(request: Request) {
  const limited = rateLimit(request, "chat", 40);
  if (limited) return limited;

  const body = (await request.json().catch(() => null)) as { messages?: unknown; context?: unknown } | null;
  const messages = parseMessages(body?.messages);
  const context = parseContext(body?.context);
  if (!messages || !context) {
    return Response.json({ error: "I didn't catch that." }, { status: 400 });
  }

  const ai = gemini();
  if (!ai) return notConfigured();

  const params = {
    contents: messages.map((m) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.text }],
    })),
    config: {
      systemInstruction: `${huginSystemPrompt(context)}\n\nThis is a chat. Answer in 1–4 short sentences unless the user asks for a draft.`,
      maxOutputTokens: 1500,
    },
  };

  try {
    // Fall back to the backup model if the main one is overloaded before streaming starts.
    const stream = await ai.models
      .generateContentStream({ ...params, model: MODELS.text[0] })
      .catch((error: unknown) => {
        if (!isRetryable(error)) throw error;
        return ai.models.generateContentStream({ ...params, model: MODELS.text[1] });
      });

    const encoder = new TextEncoder();
    const body = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (chunk.text) controller.enqueue(encoder.encode(chunk.text));
          }
        } catch (error) {
          console.error("Gemini stream failed", error);
          controller.enqueue(encoder.encode("\n\nI lost my train of thought. Ask me again."));
        }
        controller.close();
      },
    });
    return new Response(body, {
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
    });
  } catch (error) {
    return huginError(error);
  }
}
