import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { ReactElement } from "react";

export default function NotFound(): ReactElement {
  return (
    <section className="mx-auto flex max-w-3xl flex-col items-start justify-center px-5 py-28 sm:px-8">
      <span className="border border-cyan-400/40 bg-cyan-400/10 px-3 py-1 font-mono text-xs uppercase tracking-[0.2em] text-cyan-200">
        ERROR 404 // ROUTE NOT FOUND
      </span>
      <h1 className="mt-5 font-[family-name:var(--font-display)] text-4xl font-bold tracking-[-0.03em] text-slate-50 sm:text-5xl">
        This coordinate doesn&apos;t exist.
      </h1>
      <p className="mt-4 text-base leading-relaxed text-slate-300">
        The page you requested has moved or isn&apos;t published yet. Return to
        the main profile or inspect the portfolio archive.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/"
          className="inline-flex min-h-12 items-center gap-2 bg-cyan-300 px-5 text-sm font-bold text-slate-950 transition-colors hover:bg-[#b8ff3b]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>Return Home</span>
        </Link>
        <Link
          href="/portfolio"
          className="inline-flex min-h-12 items-center border border-slate-700 bg-slate-950 px-5 text-sm font-semibold text-slate-200 transition-colors hover:border-cyan-400/70 hover:text-cyan-200"
        >
          <span>Portfolio Archive</span>
        </Link>
      </div>
    </section>
  );
}
