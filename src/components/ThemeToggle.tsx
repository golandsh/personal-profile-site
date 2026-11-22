"use client";

import { Moon, Sun } from "lucide-react";
import { type ReactElement, useCallback, useEffect, useState } from "react";

type ColorSchemeOverride = "light" | "dark" | null;

const STORAGE_KEY = "color-scheme";

function readStoredScheme(): ColorSchemeOverride {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value === "light" || value === "dark" ? value : null;
  } catch {
    return null;
  }
}

function getSystemScheme(): "light" | "dark" {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return "dark";
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyMetaColorScheme(override: ColorSchemeOverride): void {
  const meta = document.querySelector<HTMLMetaElement>(
    'meta[name="color-scheme"]',
  );
  if (meta) {
    meta.content = override ?? "light dark";
  }
}

export function ThemeToggle(): ReactElement {
  const [override, setOverride] = useState<ColorSchemeOverride>(null);
  const [systemScheme, setSystemScheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const stored = readStoredScheme();
    setOverride(stored);
    applyMetaColorScheme(stored);

    if (typeof window.matchMedia === "function") {
      const media = window.matchMedia("(prefers-color-scheme: dark)");
      setSystemScheme(media.matches ? "dark" : "light");

      const handleMediaChange = (event: MediaQueryListEvent): void => {
        setSystemScheme(event.matches ? "dark" : "light");
      };
      media.addEventListener("change", handleMediaChange);

      const handleStorage = (event: StorageEvent): void => {
        if (event.key === STORAGE_KEY) {
          const next = readStoredScheme();
          setOverride(next);
          applyMetaColorScheme(next);
        }
      };
      window.addEventListener("storage", handleStorage);

      return () => {
        media.removeEventListener("change", handleMediaChange);
        window.removeEventListener("storage", handleStorage);
      };
    }

    return undefined;
  }, []);

  const currentRendered = override ?? systemScheme;
  const targetScheme: "light" | "dark" =
    currentRendered === "dark" ? "light" : "dark";

  const handleToggle = useCallback((): void => {
    const currentSys = getSystemScheme();
    const rendered = readStoredScheme() ?? currentSys;
    const nextTarget: "light" | "dark" = rendered === "dark" ? "light" : "dark";
    const nextOverride: ColorSchemeOverride =
      nextTarget === currentSys ? null : nextTarget;

    try {
      if (nextOverride === null) {
        window.localStorage.removeItem(STORAGE_KEY);
      } else {
        window.localStorage.setItem(STORAGE_KEY, nextOverride);
      }
    } catch {
      // Ignore storage errors in restricted browsing contexts
    }

    setOverride(nextOverride);
    applyMetaColorScheme(nextOverride);
  }, []);

  const label =
    targetScheme === "light" ? "Switch to light mode" : "Switch to dark mode";

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={label}
      className="inline-flex min-h-11 min-w-11 items-center justify-center border border-[var(--surface-hairline)] bg-[var(--surface-chip)] px-2.5 text-[var(--ink-secondary)] transition-colors hover:border-[var(--accent-ink)] hover:text-[var(--accent-ink)]"
    >
      <Sun className="theme-icon-sun h-4 w-4" aria-hidden="true" />
      <Moon className="theme-icon-moon h-4 w-4" aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </button>
  );
}
