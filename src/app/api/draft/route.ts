import { DRAFT_KINDS, DRAFT_TASKS, huginSystemPrompt, parseContext } from "@/lib/hugin";
import type { DraftKind } from "@/lib/quests";
import {
  gemini,
  generate,
  huginError,
  MODELS,
  notConfigured,
  parseJsonReply,
} from "@/lib/server/gemini";
import { rateLimit } from "@/lib/server/rate-limit";

const DRAFT_COUNT = 3;

const SCHEMA = {
  type: "object",
  properties: {
    drafts: {
      type: "array",
      items: { type: "string" },
      minItems: DRAFT_COUNT,
      maxItems: DRAFT_COUNT,
    },
  },
  required: ["drafts"],
};

/** POST { kind, context } → { drafts: string[] } */
export async function POST(request: Request) {
  const limited = rateLimit(request, "draft", 30);
  if (limited) return limited;

  const body = (await request.json().catch(() => null)) as { kind?: unknown; context?: unknown } | null;
  const kind = DRAFT_KINDS.find((k) => k === body?.kind) as DraftKind | undefined;
  const context = parseContext(body?.context);
  if (!kind || !context) {
    return Response.json({ error: "I need to know what to draft." }, { status: 400 });
  }

  const ai = gemini();
  if (!ai) return notConfigured();

  try {
    const response = await generate(ai, MODELS.text, {
      contents: `${DRAFT_TASKS[kind]} Return them as JSON.`,
      config: {
        systemInstruction: huginSystemPrompt(context),
        responseMimeType: "application/json",
        responseJsonSchema: SCHEMA,
        maxOutputTokens: 3000,
      },
    });
    const parsed = parseJsonReply(response.text) as { drafts?: unknown };
    const drafts = Array.isArray(parsed.drafts)
      ? parsed.drafts.filter((d): d is string => typeof d === "string" && d.trim() !== "")
      : [];
    if (!drafts.length) throw new Error("Empty drafts");
    return Response.json({ drafts: drafts.slice(0, DRAFT_COUNT) });
  } catch (error) {
    return huginError(error);
  }
}
