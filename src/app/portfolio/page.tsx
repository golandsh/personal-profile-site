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
            className="inline-flex min-h-11 items-center gap-2 font-mono text-xs uppercase tracking-[0.16em] text-slate-300 transition-colors hover:text-cyan-300"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span>Back to Profile</span>
          </Link>
        </div>

        <header className="mb-12 border-b border-slate-800/80 pb-10">
          <div className="mb-4 inline-flex items-center gap-2.5 border border-cyan-400/35 bg-cyan-400/10 px-3 py-1 font-mono text-xs uppercase tracking-[0.18em] text-cyan-200">
            <Layers className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Portfolio Archive · Future-Ready</span>
          </div>

          <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold tracking-[-0.035em] text-slate-50 sm:text-5xl">
            Systems, Architecture &amp; Upcoming Releases
          </h1>

          <p className="mt-4 max-w-3xl text-base leading-relaxed text-slate-300 sm:text-lg">
            A curated catalog of flagship systems built across my 20-year
            engineering career—structured so public demos, GitHub repositories,
            and architecture deep-dives plug directly into live slots as they
            are published.
          </p>
        </header>

        <PortfolioArchive projects={PORTFOLIO_PROJECTS} />

        <aside
          aria-label="Future portfolio links"
          className="dossier-card corner-accent mt-12 flex flex-col items-start justify-between gap-6 p-6 sm:flex-row sm:items-center sm:p-8"
        >
          <div>
            <div className="font-mono text-xs uppercase tracking-[0.18em] text-cyan-300">
              {"//"} DIRECT ACCESS
            </div>
            <h2 className="mt-1.5 font-[family-name:var(--font-display)] text-xl font-bold text-slate-50">
              Interested in an architecture walkthrough?
            </h2>
            <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-slate-300">
              While public case-study links are being prepared, I am happy to
              walk through system designs, payment workflows, and engineering
              leadership outcomes directly.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href={`mailto:${PROFILE.email}`}
              className="inline-flex min-h-11 items-center gap-2 bg-cyan-300 px-5 text-xs font-bold uppercase tracking-[0.12em] text-slate-950 transition-colors hover:bg-[#b8ff3b]"
            >
              <span>Request Walkthrough</span>
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </a>
            <a
              href={PROFILE.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-2 border border-slate-700 bg-slate-950 px-5 text-xs font-semibold uppercase tracking-[0.12em] text-slate-200 transition-colors hover:border-cyan-400/70 hover:text-cyan-200"
            >
              <span>LinkedIn Profile</span>
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
}
