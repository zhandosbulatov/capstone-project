import "server-only";

// A small per-visitor limit so a public demo link can't burn the Gemini key. In memory, so each
// server instance counts on its own: enough for a demo, not a security boundary.

const WINDOW_MS = 10 * 60 * 1000;
const MAX_KEYS = 5000;

const hits = new Map<string, number[]>();

function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "local";
}

/** Returns a 429 response when the visitor is over the limit, otherwise null. */
export function rateLimit(request: Request, bucket: string, max: number): Response | null {
  const key = `${bucket}:${clientIp(request)}`;
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= max) {
    return Response.json(
      { error: "That's a lot of questions for ten minutes. Take a break and come back." },
      { status: 429 },
    );
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > MAX_KEYS) hits.delete(hits.keys().next().value!);
  return null;
}
