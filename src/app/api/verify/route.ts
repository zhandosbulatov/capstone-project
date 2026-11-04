import { createPartFromBase64 } from "@google/genai";
import { RESULT_TYPES, RESULTS, type ResultType } from "@/lib/game";
import { PROOF_RULES } from "@/lib/hugin";
import {
  gemini,
  generate,
  huginError,
  MODELS,
  notConfigured,
  parseJsonReply,
} from "@/lib/server/gemini";
import { rateLimit } from "@/lib/server/rate-limit";
import { MAX_PROOF_BYTES } from "@/lib/verify-client";

const IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/heic", "image/heif"];

const SCHEMA = {
  type: "object",
  properties: {
    verified: { type: "boolean" },
    reason: { type: "string" },
  },
  required: ["verified", "reason"],
};

const SYSTEM = `You are Hugin, a calm raven with dry humour, checking proof screenshots for a coaching app. Users upload a screenshot to prove a real-world result.

Decide only whether the image plausibly shows the claimed result. Be fair, not paranoid: a cropped or blurred screenshot is fine, and names may be hidden on purpose. Reject images that clearly show something else, are blank, or are obviously not a screenshot of the claimed result.

The reason is one short sentence to the user, in Hugin's voice: calm, dry, no exclamation marks, no emoji. Never repeat names, emails, phone numbers or amounts you see in the image. If rejected, say what you'd need to see instead. Example rejection: "That's a lovely screenshot of a lunch menu. I need the reply."`;

/** POST multipart { image, result } → { verified, reason }. The image is never stored. */
export async function POST(request: Request) {
  const limited = rateLimit(request, "verify", 15);
  if (limited) return limited;

  const form = await request.formData().catch(() => null);
  const image = form?.get("image");
  const result = RESULT_TYPES.find((r) => r === form?.get("result")) as ResultType | undefined;

  if (!(image instanceof File) || !result) {
    return Response.json({ error: "I need a screenshot and what it shows." }, { status: 400 });
  }
  if (!IMAGE_TYPES.includes(image.type)) {
    return Response.json({ verified: false, reason: "That isn't an image I can read. A PNG or JPEG, please." });
  }
  if (image.size > MAX_PROOF_BYTES) {
    return Response.json({ verified: false, reason: "That image is over 4 MB. Crop it and try again." });
  }

  const ai = gemini();
  if (!ai) return notConfigured();

  try {
    const data = Buffer.from(await image.arrayBuffer()).toString("base64");
    const response = await generate(ai, MODELS.vision, {
      contents: [
        {
          role: "user",
          parts: [
            createPartFromBase64(data, image.type),
            {
              text: `Claimed result: ${RESULTS[result].label}. Counts as proof: ${PROOF_RULES[result]}. Does this screenshot show it? Answer as JSON.`,
            },
          ],
        },
      ],
      config: {
        systemInstruction: SYSTEM,
        responseMimeType: "application/json",
        responseJsonSchema: SCHEMA,
        // Room for the model's thinking as well as the short verdict.
        maxOutputTokens: 2048,
      },
    });
    const parsed = parseJsonReply(response.text) as { verified?: unknown; reason?: unknown };
    if (typeof parsed.verified !== "boolean" || typeof parsed.reason !== "string") {
      throw new Error("Unexpected verdict shape");
    }
    return Response.json({ verified: parsed.verified, reason: parsed.reason.trim() });
  } catch (error) {
    return huginError(error);
  }
}
