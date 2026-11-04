"use client";

// Short growth notifications: "+10 XP · Clarity +1", "Level 4", "New title: Side Starter".

import { useEffect, ViewTransition } from "react";
import { useCoach, type Toast } from "./app-context";
import { HuginAvatar } from "./hugin";

const TOAST_MS = 3500;
const MAX_VISIBLE = 4;

function ToastItem({ toast, delay }: { toast: Toast; delay: number }) {
  const { actions } = useCoach();
  const { dismissToast } = actions;
  useEffect(() => {
    const id = setTimeout(() => dismissToast(toast.id), TOAST_MS + delay);
    return () => clearTimeout(id);
  }, [toast.id, delay, dismissToast]);

  return (
    <li className="pointer-events-auto rounded-xl bg-ink px-3.5 py-2.5 text-sm text-bg shadow-lg">
      <p className="font-semibold">{toast.text}</p>
      {toast.hugin ? (
        <p className="mt-1 flex items-center gap-2 text-[13px] opacity-80">
          <HuginAvatar size={20} />
          {toast.hugin}
        </p>
      ) : null}
    </li>
  );
}

export function Toasts() {
  const { state } = useCoach();
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-20 z-30 mx-auto w-full max-w-[440px] px-4"
    >
      <ul className="flex flex-col gap-2">
        {state.toasts.slice(-MAX_VISIBLE).map((toast, i) => (
          <ViewTransition key={toast.id} enter="toast-in" exit="toast-out" default="none">
            <ToastItem toast={toast} delay={i * 500} />
          </ViewTransition>
        ))}
      </ul>
    </div>
  );
}
