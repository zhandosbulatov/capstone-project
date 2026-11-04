import type { Metadata } from "next";
import { CoachApp } from "@/components/coach/coach-app";

export const metadata: Metadata = {
  title: "Today · AI Business Coach",
};

export default function AppPage() {
  return <CoachApp />;
}
