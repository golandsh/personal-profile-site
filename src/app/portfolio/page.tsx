import { ArrowLeft, ArrowUpRight, Layers } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import type { ReactElement } from "react";
import { PortfolioArchive } from "@/components/PortfolioArchive";
import { PORTFOLIO_PROJECTS } from "@/data/portfolio";
import { PROFILE } from "@/data/profile";

export const metadata: Metadata = {
  title: "Portfolio Archive",
  description:
    "Architecture dossiers, case studies, and future live project links by Shlomi Goland across visual editor engines, Recurly payment platforms, AWS serverless systems, and AI workflows.",
};

export default function PortfolioPage(): ReactElement {
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
          <div className="mb-4 inline-flex items-center gap-2.5 border border-[var(--accent-ink)]/35 bg-[var(--accent-soft)] px-3 py-1 font-mono text-xs uppercase tracking-[0.18em] text-[var(--accent-ink-strong)]">
            <Layers className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Portfolio Archive · Future-Ready</span>
          </div>

          <h1 className="font-display text-4xl font-bold tracking-[-0.035em] text-[var(--ink-primary)] sm:text-5xl">
            Projects, Systems &amp; Work Archive
          </h1>

          <p className="mt-4 max-w-3xl text-base leading-relaxed text-[var(--ink-secondary)] sm:text-lg">
            Projects built across my engineering career—including AI voice and
            LangChain agents, email signature testing and rule engines, agronomy
            tools, toll-road integrations, and legacy system simplifications.
          </p>
        </header>

        <PortfolioArchive projects={PORTFOLIO_PROJECTS} />

        <aside
          aria-label="Future portfolio links"
          className="dossier-card corner-accent mt-12 flex flex-col items-start justify-between gap-6 p-6 sm:flex-row sm:items-center sm:p-8"
        >
          <div>
            <div className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--accent-ink)]">
              {"//"} DIRECT ACCESS
            </div>
            <h2 className="mt-1.5 font-display text-xl font-bold text-[var(--ink-primary)]">
              Interested in walking through any of these?
            </h2>
            <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-[var(--ink-secondary)]">
              While public case-study links are being added, I am always happy to
              walk through the architecture and decisions behind these projects.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href={`mailto:${PROFILE.email}`}
              className="inline-flex min-h-11 items-center gap-2 bg-[var(--accent-solid)] px-5 text-xs font-bold uppercase tracking-[0.12em] text-[var(--accent-on-solid)] transition-colors hover:bg-[var(--accent-solid-hover)]"
            >
              <span>Request Walkthrough</span>
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
}
