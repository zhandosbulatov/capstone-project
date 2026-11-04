import { ImageResponse } from "next/og";

export const alt = "AI Business Coach: Good at your job? Someone will pay you for it.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Colours from the design tokens (light theme).
const BG = "#fbfaf7";
const INK = "#1b1b1a";
const MUTED = "#5f5e5a";
const ACCENT = "#2862c9";
const ACCENT_SOFT = "#e7effc";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: BG,
          color: INK,
          padding: "56px 80px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 30, fontWeight: 700 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 26,
              background: ACCENT_SOFT,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ width: 26, height: 22, borderRadius: "14px 14px 4px 14px", background: INK }} />
          </div>
          AI Business Coach
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              alignSelf: "flex-start",
              background: ACCENT_SOFT,
              color: ACCENT,
              fontSize: 26,
              fontWeight: 700,
              padding: "8px 20px",
              borderRadius: 999,
              letterSpacing: 1,
            }}
          >
            GOOD AT YOUR JOB?
          </div>
          <div style={{ fontSize: 72, lineHeight: 1.05, marginTop: 28, letterSpacing: -1 }}>
            Someone will pay you for it.
          </div>
          <div style={{ fontSize: 32, color: MUTED, marginTop: 20, maxWidth: 900 }}>
            Your first paying client in 30 days. 20 minutes a day, without quitting your job.
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "flex-start", gap: 14, fontSize: 24, color: MUTED }}>
          {["Week 1 · First reply", "Week 2 · First call", "Week 3 · First proposal", "Week 4 · First client"].map(
            (step) => (
              <div
                key={step}
                style={{
                  display: "flex",
                  flexShrink: 0,
                  whiteSpace: "nowrap",
                  border: "2px solid #e6e3dc",
                  borderRadius: 14,
                  padding: "10px 16px",
                }}
              >
                {step}
              </div>
            ),
          )}
        </div>
      </div>
    ),
    size,
  );
}
