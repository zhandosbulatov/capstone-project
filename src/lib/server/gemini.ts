import "server-only";

import {
  ApiError,
  GoogleGenAI,
  type GenerateContentParameters,
  type GenerateContentResponse,
} from "@google/genai";

// Each job has a main model and a backup, tried in order when a model is overloaded or returns
// nothing. Override the main one with env vars if Google renames or retires a model.
export const MODELS = {
  // gemini-2.5-flash-lite was retired (404 "no longer available to new users"), so the text
  // backup is the vision main model, which the app already relies on.
  text: [process.env.GEMINI_TEXT_MODEL || "gemini-3.5-flash-lite", "gemini-3.6-flash"],
  vision: [process.env.GEMINI_VISION_MODEL || "gemini-3.6-flash", "gemini-3.5-flash-lite"],
} as const;

/** Statuses worth retrying on the backup model: rate limits and overload. */
const RETRY_STATUSES = [429, 500, 503];

export function isRetryable(error: unknown): boolean {
  return error instanceof ApiError && RETRY_STATUSES.includes(error.status);
}

/** generateContent with the backup model when the main one is overloaded or replies empty. */
export async function generate(
  ai: GoogleGenAI,
  models: readonly string[],
  params: Omit<GenerateContentParameters, "model">,
): Promise<GenerateContentResponse> {
  let lastError: unknown = new Error("No models configured");
  for (const model of models) {
    try {
      const response = await ai.models.generateContent({ ...params, model });
      if (response.text?.trim()) return response;
      lastError = new Error(`Empty reply from ${model}`);
    } catch (error) {
      if (!isRetryable(error)) throw error;
      lastError = error;
    }
  }
  throw lastError;
}

let client: GoogleGenAI | null = null;

/** Null when GEMINI_API_KEY isn't set. */
export function gemini(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  client ??= new GoogleGenAI({ apiKey });
  return client;
}

export { parseJsonReply } from "@/lib/hugin";

/** A JSON error response in Hugin's voice, with the right status for the failure. */
export function huginError(error: unknown): Response {
  if (error instanceof ApiError && error.status === 429) {
    return Response.json(
      { error: "I've had too many questions in a short time. Give me a minute." },
      { status: 429 },
    );
  }
  console.error("Gemini call failed", error);
  return Response.json(
    { error: "I can't think straight right now. The quest still works without me." },
    { status: 502 },
  );
}

export function notConfigured(): Response {
  return Response.json(
    { error: "Hugin isn't connected yet. The quest still works without him." },
    { status: 503 },
  );
}
