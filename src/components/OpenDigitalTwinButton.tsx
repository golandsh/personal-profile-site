"use client";

import { Sparkles } from "lucide-react";
import type { ReactElement } from "react";

export const OPEN_DIGITAL_TWIN_EVENT = "open-digital-twin";

export function dispatchOpenDigitalTwin(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(OPEN_DIGITAL_TWIN_EVENT));
  }
}

export interface OpenDigitalTwinButtonProps {
  readonly label?: string;
}

export function OpenDigitalTwinButton({
  label = "Ask My Digital Twin",
}: OpenDigitalTwinButtonProps): ReactElement {
  return (
    <button
      type="button"
      onClick={dispatchOpenDigitalTwin}
      className="inline-flex min-h-12 items-center gap-2 border border-[var(--accent-ink)]/60 bg-[var(--accent-soft)] px-5 text-sm font-semibold text-[var(--accent-ink-strong)] transition-colors hover:bg-[var(--accent-solid)] hover:text-[var(--accent-on-solid)]"
    >
      <Sparkles className="h-4 w-4 text-[var(--accent-volt)]" aria-hidden="true" />
      <span>{label}</span>
    </button>
  );
}
