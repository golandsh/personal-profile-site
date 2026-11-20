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
        className="inline-flex min-h-12 w-full items-center justify-center gap-2 border border-slate-700 bg-slate-950/80 px-4 font-mono text-xs uppercase tracking-[0.12em] text-slate-200 transition-colors hover:border-cyan-400/70 hover:text-cyan-200"
      >
        {copyState === "copied" ? (
          <>
            <Check className="h-4 w-4 text-[#b8ff3b]" aria-hidden="true" />
            <span>Copied</span>
          </>
        ) : (
          <>
            <Copy className="h-4 w-4 text-cyan-300" aria-hidden="true" />
            <span>Copy Email</span>
          </>
        )}
      </button>

      <p
        role="status"
        aria-live="polite"
        className="min-h-4 font-mono text-xs text-cyan-200"
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
