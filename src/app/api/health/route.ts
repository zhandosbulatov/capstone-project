import { connection } from "next/server";

// Deploy check. Gemini routes live next to this one under /api.
export async function GET() {
  // Read env at request time, not at build time.
  await connection();
  return Response.json({
    ok: true,
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
  });
}
