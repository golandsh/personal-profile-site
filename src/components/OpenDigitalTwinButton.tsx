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
      className="inline-flex min-h-12 items-center gap-2 border border-cyan-400/60 bg-cyan-400/12 px-5 text-sm font-semibold text-cyan-200 transition-colors hover:border-cyan-300 hover:bg-cyan-400/20 hover:text-white"
    >
      <Sparkles className="h-4 w-4 text-[#b8ff3b]" aria-hidden="true" />
      <span>{label}</span>
    </button>
  );
}
