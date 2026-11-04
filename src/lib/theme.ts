// Theme choice: follow the system, or force light or dark. Saved in this browser only.
// "system" means no data-theme attribute, so the CSS media query decides (globals.css).

export type Theme = "system" | "light" | "dark";

export const THEMES: readonly Theme[] = ["system", "light", "dark"];

const KEY = "abc-theme";
const EVENT = "abc-themechange";

function isForced(value: unknown): value is "light" | "dark" {
  return value === "light" || value === "dark";
}

/** The saved choice, or "system" when nothing (or nothing valid) is saved. */
export function readTheme(): Theme {
  try {
    const value = localStorage.getItem(KEY);
    return isForced(value) ? value : "system";
  } catch {
    return "system";
  }
}

/** Put the choice on <html> without saving it. */
export function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  if (isForced(theme)) root.setAttribute("data-theme", theme);
  else root.removeAttribute("data-theme");
}

/** Save, apply and tell every switcher on the page. */
export function setTheme(theme: Theme): void {
  try {
    if (isForced(theme)) localStorage.setItem(KEY, theme);
    else localStorage.removeItem(KEY);
  } catch {
    // Storage blocked: the choice still applies to this page.
  }
  applyTheme(theme);
  window.dispatchEvent(new Event(EVENT));
}

/** For useSyncExternalStore: changes from this tab and from other tabs. */
export function subscribeTheme(onChange: () => void): () => void {
  const onStorage = (e: StorageEvent) => {
    if (e.key !== KEY) return;
    applyTheme(readTheme());
    onChange();
  };
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onStorage);
  };
}

/** Runs in <head> while the HTML parses, so a saved theme is on before the first paint. */
export const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem(${JSON.stringify(KEY)});if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;
