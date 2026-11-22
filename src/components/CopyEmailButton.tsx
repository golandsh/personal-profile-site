"use client";

import { Check, Copy } from "lucide-react";
import { type ReactElement, useEffect, useRef, useState } from "react";

type CopyState = "idle" | "copied" | "failed";

export interface CopyEmailButtonProps {
  readonly email: string;
}

export function CopyEmailButton({ email }: CopyEmailButtonProps): ReactElement {
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const resetTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimerRef.current !== null) {
        window.clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  const handleCopyEmail = async (): Promise<void> => {
    if (resetTimerRef.current !== null) {
      window.clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    }

    try {
      if (typeof navigator === "undefined" || !navigator.clipboard) {
        setCopyState("failed");
        return;
      }

      await navigator.clipboard.writeText(email);
      setCopyState("copied");
      resetTimerRef.current = window.setTimeout(() => {
        setCopyState("idle");
        resetTimerRef.current = null;
      }, 2800);
    } catch {
      setCopyState("failed");
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => {
          void handleCopyEmail();
        }}
        className="inline-flex min-h-12 w-full items-center justify-center gap-2 border border-[var(--surface-hairline)] bg-[var(--surface-chip)] px-3.5 font-mono text-xs uppercase tracking-[0.12em] text-[var(--ink-primary)] transition-colors hover:border-[var(--accent-ink)] hover:text-[var(--accent-ink)]"
      >
        {copyState === "copied" ? (
          <>
            <Check className="h-4 w-4 text-[var(--accent-volt)]" aria-hidden="true" />
            <span>Copied</span>
          </>
        ) : (
          <>
            <Copy className="h-4 w-4 text-[var(--accent-ink)]" aria-hidden="true" />
            <span>Copy Email</span>
          </>
        )}
      </button>

      <p
        role="status"
        aria-live="polite"
        className="min-h-4 font-mono text-xs text-[var(--accent-ink)]"
      >
        {copyState === "copied"
          ? `Email ${email} copied to clipboard.`
          : copyState === "failed"
            ? `Copy unavailable—email directly at ${email}.`
            : ""}
      </p>
    </div>
  );
}
