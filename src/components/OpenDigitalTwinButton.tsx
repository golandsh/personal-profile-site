"use client";

import { Sparkles } from "lucide-react";
import { type ReactElement, useEffect, useState } from "react";

export const OPEN_DIGITAL_TWIN_EVENT = "open-digital-twin";
export const DIGITAL_TWIN_AVAILABILITY_EVENT = "digital-twin-availability";

export function dispatchOpenDigitalTwin(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(OPEN_DIGITAL_TWIN_EVENT));
  }
}

export function dispatchDigitalTwinAvailability(available: boolean): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent<{ readonly available: boolean }>(
        DIGITAL_TWIN_AVAILABILITY_EVENT,
        { detail: { available } },
      ),
    );
  }
}

export interface OpenDigitalTwinButtonProps {
  readonly label?: string;
}

export function OpenDigitalTwinButton({
  label = "Ask My Digital Twin",
}: OpenDigitalTwinButtonProps): ReactElement | null {
  const [available, setAvailable] = useState<boolean>(true);

  useEffect(() => {
    const handleAvailability = (event: Event): void => {
      if (event instanceof CustomEvent) {
        const detail: unknown = event.detail;
        if (
          typeof detail === "object" &&
          detail !== null &&
          "available" in detail &&
          typeof detail.available === "boolean"
        ) {
          setAvailable(detail.available);
        }
      }
    };

    window.addEventListener(DIGITAL_TWIN_AVAILABILITY_EVENT, handleAvailability);
    return () => {
      window.removeEventListener(
        DIGITAL_TWIN_AVAILABILITY_EVENT,
        handleAvailability,
      );
    };
  }, []);

  if (!available) {
    return null;
  }

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
