"use client";

// Theme switcher: System, Light or Dark, as a three-way segmented control (radio group).
// The saved choice is applied before paint by THEME_SCRIPT in the root layout.

import { useId, useLayoutEffect, useSyncExternalStore } from "react";
import { applyTheme, readTheme, setTheme, subscribeTheme, THEMES, type Theme } from "@/lib/theme";
import { Icon, type IconName } from "./icons";

const OPTIONS: Record<Theme, { label: string; icon: IconName }> = {
  system: { label: "System", icon: "desktop" },
  light: { label: "Light", icon: "sun" },
  dark: { label: "Dark", icon: "moon" },
};

export function ThemeSwitcher({ className = "" }: { className?: string }) {
  const theme = useSyncExternalStore(subscribeTheme, readTheme, () => "system" as Theme);
  const name = useId();

  return (
    <fieldset className={className}>
      <legend className="sr-only">Theme</legend>
      <div className="inline-flex gap-1 rounded-md border border-line bg-canvas p-1">
        {THEMES.map((value) => (
          <label
            key={value}
            className="flex cursor-pointer items-center gap-1.5 rounded px-3 py-1.5 text-sm font-semibold text-ink-muted transition-colors duration-150 hover:text-ink has-checked:bg-surface has-checked:text-ink has-checked:ring-1 has-checked:ring-line-strong has-focus-visible:outline-2 has-focus-visible:outline-offset-1 has-focus-visible:outline-ink"
          >
            <input
              type="radio"
              name={name}
              value={value}
              checked={theme === value}
              onChange={() => setTheme(value)}
              className="sr-only"
            />
            <Icon name={OPTIONS[value].icon} size={16} />
            {OPTIONS[value].label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/**
 * Re-applies the saved theme after hydration. In production the head script already did it;
 * in development React's Strict Mode remount clears attributes on <html>, so this puts it back.
 */
export function ThemeSync() {
  useLayoutEffect(() => {
    applyTheme(readTheme());
  }, []);
  return null;
}
