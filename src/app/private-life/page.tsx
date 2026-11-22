import { ArrowLeft, Hammer } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import type { ReactElement } from "react";
import { PrivateLifeSection } from "@/components/PrivateLifeSection";

export const metadata: Metadata = {
  title: "Private Life",
  description:
    "Hobbies, interests, and personal life photos from Shlomi Goland (currently under construction).",
};

export default function PrivateLifePage(): ReactElement {
  return (
    <div className="py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center gap-2 font-mono text-xs uppercase tracking-[0.16em] text-[var(--ink-secondary)] transition-colors hover:text-[var(--accent-ink)]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span>Back to Profile</span>
          </Link>
        </div>

        <header className="mb-12 border-b border-[var(--surface-hairline)] pb-10">
          <div className="mb-4 inline-flex items-center gap-2.5 border border-amber-500/40 bg-amber-500/10 px-3 py-1 font-mono text-xs uppercase tracking-[0.18em] text-[var(--ink-primary)]">
            <Hammer className="h-3.5 w-3.5 text-amber-500" aria-hidden="true" />
            <span>Under Construction</span>
          </div>

          <h1 className="font-display text-4xl font-bold tracking-[-0.035em] text-[var(--ink-primary)] sm:text-5xl">
            Private Life
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-relaxed text-[var(--ink-secondary)] sm:text-lg">
            A separate corner for hobbies, personal interests, and photos from
            life outside of work. Currently under construction.
          </p>
        </header>

        <PrivateLifeSection />
      </div>
    </div>
  );
}
