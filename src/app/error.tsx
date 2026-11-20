"use client";

import { RotateCcw } from "lucide-react";
import Link from "next/link";
import type { ReactElement } from "react";

interface ErrorBoundaryProps {
  readonly error: Error & { readonly digest?: string };
  readonly reset: () => void;
}

export default function GlobalError({
  reset,
}: ErrorBoundaryProps): ReactElement {
  return (
    <section className="mx-auto flex max-w-3xl flex-col items-start justify-center px-5 py-28 sm:px-8">
      <span className="border border-cyan-400/40 bg-cyan-400/10 px-3 py-1 font-mono text-xs uppercase tracking-[0.2em] text-cyan-200">
        RUNTIME RECOVERY // UNEXPECTED FAULT
      </span>
      <h1 className="mt-5 font-display text-4xl font-bold tracking-[-0.03em] text-slate-50 sm:text-5xl">
        Something interrupted rendering.
      </h1>
      <p className="mt-4 text-base leading-relaxed text-slate-300">
        An unexpected error occurred while loading this view. You can retry the
        view safely or return to the main profile.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex min-h-12 items-center gap-2 bg-cyan-300 px-5 text-sm font-bold text-slate-950 transition-colors hover:bg-[#b8ff3b]"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          <span>Try Again</span>
        </button>
        <Link
          href="/"
          className="inline-flex min-h-12 items-center border border-slate-700 bg-slate-950 px-5 text-sm font-semibold text-slate-200 transition-colors hover:border-cyan-400/70 hover:text-cyan-200"
        >
          <span>Return Home</span>
        </Link>
      </div>
    </section>
  );
}
