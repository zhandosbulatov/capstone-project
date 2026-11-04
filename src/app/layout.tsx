import type { Metadata, Viewport } from "next";
import { Figtree, Young_Serif } from "next/font/google";
import { ThemeSync } from "@/components/theme-switcher";
import { THEME_SCRIPT } from "@/lib/theme";
import "./globals.css";

// Body: Figtree. Display: Young Serif (one weight). See DESIGN.md.
const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
});

const youngSerif = Young_Serif({
  variable: "--font-young-serif",
  subsets: ["latin"],
  weight: "400",
});

// Vercel sets the production domain; locally the dev server is the base for absolute OG URLs.
const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "AI Business Coach",
  description:
    "Your first paying client in 30 days. 20 minutes a day, without quitting your job.",
  openGraph: {
    type: "website",
    siteName: "AI Business Coach",
    title: "Good at your job? Someone will pay you for it.",
    description:
      "An AI coach that turns the skill you use at work into a paid side service. Your first paying client in 30 days.",
  },
  twitter: { card: "summary_large_image" },
};

// Browser bar colour matches the page background in each theme.
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F9F6F3" },
    { media: "(prefers-color-scheme: dark)", color: "#15111B" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning: the head script may add data-theme before React hydrates.
    <html
      lang="en"
      className={`${figtree.variable} ${youngSerif.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <ThemeSync />
        <a
          href="#main"
          className="sr-only rounded-lg bg-ink px-4 py-2 font-semibold text-canvas focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
