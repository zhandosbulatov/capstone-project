// Sends a proof screenshot to /api/verify. The image is checked and then dropped: only the
// verdict comes back and only the verdict is saved.

import type { ResultType } from "./game";

export const MAX_PROOF_BYTES = 4 * 1024 * 1024;

export type Verdict =
  | { status: "verified"; reason: string }
  | { status: "rejected"; reason: string }
  | { status: "unavailable"; reason: string };

export async function verifyScreenshot(file: File, result: ResultType): Promise<Verdict> {
  if (!file.type.startsWith("image/")) {
    return { status: "rejected", reason: "That isn't an image. A screenshot, please." };
  }
  if (file.size > MAX_PROOF_BYTES) {
    return { status: "rejected", reason: "That image is over 4 MB. Crop it and try again." };
  }

  const body = new FormData();
  body.append("image", file);
  body.append("result", result);

  try {
    const res = await fetch("/api/verify", { method: "POST", body });
    if (!res.ok) {
      return {
        status: "unavailable",
        reason: "I can't check screenshots right now. Log it without proof, or try again later.",
      };
    }
    const data = (await res.json()) as { verified: boolean; reason: string };
    return { status: data.verified ? "verified" : "rejected", reason: data.reason };
  } catch {
    return {
      status: "unavailable",
      reason: "No connection. Log it without proof, or try again when you're back online.",
    };
  }
}
