import {
  cleanReview,
  draftInstruction,
  hasBrackets,
  huginSystemPrompt,
  parseDraftRequest,
  reviewInstruction,
  reviewSchema,
  stripBracketSentences,
  STRICT_RETRY,
} from "@/lib/hugin";
import {
  gemini,
  generate,
  huginError,
  MODELS,
  notConfigured,
  parseJsonReply,
} from "@/lib/server/gemini";
import { rateLimit } from "@/lib/server/rate-limit";

function schemaFor(count: number) {
  return {
    type: "object",
    properties: {
      drafts: {
        type: "array",
        items: { type: "string" },
        minItems: count,
        maxItems: count,
      },
    },
    required: ["drafts"],
  };
}

/**
 * POST { kind, context, contact?, lesson?, count? } → { drafts: string[] }
 * POST { kind: "review", context, lesson } → { review: { feedback, improved } }
 * With `contact` the default is one draft; without it, three.
 */
export async function POST(request: Request) {
  const limited = rateLimit(request, "draft", 30);
  if (limited) return limited;

  const parsed = parseDraftRequest(await request.json().catch(() => null));
  if (!parsed.ok) return Response.json({ error: parsed.error }, { status: 400 });

  const ai = gemini();
  if (!ai) return notConfigured();

  try {
    if (parsed.kind === "review") {
      const lesson = parsed.lesson!;
      const response = await generate(ai, MODELS.text, {
        contents: reviewInstruction(lesson),
        config: {
          systemInstruction: huginSystemPrompt(parsed.context),
          responseMimeType: "application/json",
          responseJsonSchema: reviewSchema(lesson.id),
          maxOutputTokens: 2000,
        },
      });
      const review = cleanReview(parseJsonReply(response.text), lesson.id);
      if (!review) throw new Error("Empty review");
      return Response.json({ review });
    }

    const { kind, context, contact, count } = parsed;
    let instruction = draftInstruction(kind, count, !!contact);
    if (parsed.lesson) {
      const fields = Object.entries(parsed.lesson.fields)
        .map(([id, value]) => `${id}: ${value}`)
        .join("; ");
      instruction += ` Use this saved decision: ${fields}.`;
    }

    const ask = async (extra: string): Promise<string[]> => {
      const response = await generate(ai, MODELS.text, {
        contents: instruction + extra,
        config: {
          systemInstruction: huginSystemPrompt(context, contact),
          responseMimeType: "application/json",
          responseJsonSchema: schemaFor(count),
          maxOutputTokens: 3000,
        },
      });
      const body = parseJsonReply(response.text) as { drafts?: unknown };
      return Array.isArray(body.drafts)
        ? body.drafts.filter((d): d is string => typeof d === "string" && d.trim() !== "")
        : [];
    };

    let drafts = await ask("");
    if (drafts.some(hasBrackets)) drafts = await ask(STRICT_RETRY);
    // Still bracketed after the retry: cut the bracketed sentences and keep what is left.
    drafts = drafts.map((d) => (hasBrackets(d) ? stripBracketSentences(d) : d)).filter(Boolean);
    if (!drafts.length) throw new Error("Empty drafts");
    return Response.json({ drafts: drafts.slice(0, count) });
  } catch (error) {
    return huginError(error);
  }
}
