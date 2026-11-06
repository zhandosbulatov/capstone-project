import type { Metadata } from "next";
import { Quiz } from "@/components/quiz/quiz";

export const metadata: Metadata = {
  title: "Build your plan · AI Business Coach",
  description: "6 questions, 1 minute: your plan to a first paying client in 12 weeks.",
};

export default function QuizPage() {
  return <Quiz />;
}
