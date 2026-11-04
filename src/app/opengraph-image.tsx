import { ImageResponse } from "next/og";

export const alt = "AI Business Coach: Good at your job? Someone will pay you for it.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Colours from the design tokens (light theme): canvas, ink, ink-muted, brand peach and sunshine. OG images cannot read CSS variables.
const BG = "#F9F6F3";
const INK = "#1B1624";
const MUTED = "#5F5B66";
const ACCENT = "#FD976D";
const ACCENT_SOFT = "#FDD46B";

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
          <div style={{ display: "flex", fontSize: 72, lineHeight: 1.05, color: MUTED, letterSpacing: -1 }}>
            Good at your job?
          </div>
          <div style={{ fontSize: 72, lineHeight: 1.05, letterSpacing: -1 }}>
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
                  borderTop: `6px solid ${ACCENT}`,
                  borderRadius: 6,
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
