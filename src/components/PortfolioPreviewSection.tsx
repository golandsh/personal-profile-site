import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { ReactElement } from "react";
import { PortfolioCard } from "@/components/PortfolioCard";
import { SectionHeading } from "@/components/SectionHeading";
import { PORTFOLIO_PROJECTS } from "@/data/portfolio";

export function PortfolioPreviewSection(): ReactElement {
  return (
    <section
      id="portfolio"
      className="border-b border-slate-800/80 py-20 sm:py-24"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading
            index="04"
            eyebrow="Portfolio & Case Studies"
            title="Selected systems & future showcase."
            subtitle="Structured architectural dossiers built to connect directly to live deployments, repositories, and deep-dive write-ups as new public projects launch."
          />

          <div className="mb-10 md:mb-12">
            <Link
              href="/portfolio"
              className="inline-flex min-h-12 items-center gap-2 border border-cyan-400/60 bg-cyan-400/10 px-5 text-sm font-semibold text-cyan-200 transition-colors hover:bg-cyan-300 hover:text-slate-950"
            >
              <span>Open Full Portfolio Archive</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {PORTFOLIO_PROJECTS.map((project) => (
            <PortfolioCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
}
