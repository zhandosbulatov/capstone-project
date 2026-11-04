import type { Metadata } from "next";
import { Quiz } from "@/components/quiz/quiz";

export const metadata: Metadata = {
  title: "Build your plan · AI Business Coach",
  description: "6 quick questions, 1 minute: your 30-day plan to a first paying client.",
};

export default function QuizPage() {
  return <Quiz />;
}
