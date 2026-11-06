// A static picture of the real Today screen for the landing page: the Client #1 card, one step with
// Hugin's draft already inside, and the minimum. Built from the same tokens as /app, with sample data.

import { HuginAvatar } from "@/components/coach/hugin";
import { Icon } from "@/components/icons";
import { Card } from "@/components/ui";

export function AppPreview() {
  return (
    <div
      aria-label="A preview of the Today screen: your Client #1 card, one step with Hugin's message to Sarah already written, and a Send button"
      role="img"
      className="mx-auto w-full max-w-[380px] rounded-md border border-line-strong bg-canvas p-3"
    >
      <div className="flex items-center justify-between px-1 pt-1 pb-2 text-sm">
        <p className="font-display text-base">Day 8</p>
        <p className="flex items-center gap-2.5 font-semibold tabular-nums">
          <span className="flex items-center gap-1">
            <Icon name="flame" size={15} className="text-brand" />7
          </span>
          <HuginAvatar size={26} />
        </p>
      </div>

      <div className="rounded-md bg-sun px-4 py-3.5 text-on-bright">
        <span className="block text-sm font-semibold">
          Client #1 · Brand starter kit for local businesses · $450
        </span>
        <span className="mt-1 block text-base font-bold tabular-nums">
          5 listed → 2 messaged → 1 replied → 0 paid
        </span>
      </div>

      <p className="type-label mt-3 mb-1.5 px-1">Today · about 2 min · keeps your streak</p>
      <Card className="my-0">
        <h2 className="font-display text-xl leading-snug">Message Sarah</h2>
        <p className="mt-0.5 text-sm text-ink-muted">Ex-colleague</p>
        <p className="mt-3 rounded-md bg-canvas px-3.5 py-3 text-base">
          Hi Sarah, it&apos;s been a while. I&apos;ve started offering brand starter kits to local businesses on the side. You know how I work, so I wanted you to hear it first. Open to a quick chat?
        </p>
        <div className="mt-3 flex min-h-12 items-center justify-center rounded-full bg-brand px-6 text-base font-semibold text-on-bright">
          Send
        </div>
        <p className="mt-3 flex items-start gap-2.5 text-sm text-ink-muted">
          <HuginAvatar size={22} />
          <span className="pt-0.5">They know your work. That&apos;s the whole introduction.</span>
        </p>
      </Card>
    </div>
  );
}
