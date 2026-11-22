import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { ReactElement } from "react";
import { PortfolioCard } from "@/components/PortfolioCard";
import { SectionHeading } from "@/components/SectionHeading";
import { PORTFOLIO_PROJECTS } from "@/data/portfolio";

const PREVIEW_PROJECT_COUNT = 4;

export function PortfolioPreviewSection(): ReactElement {
  const featuredProjects = PORTFOLIO_PROJECTS.slice(0, PREVIEW_PROJECT_COUNT);

  return (
    <section
      id="portfolio"
      className="border-b border-[var(--surface-hairline)] py-20 sm:py-24"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading
            index="04"
            eyebrow="Portfolio & Projects"
            title="Selected projects & work."
            subtitle="A look at projects across AI voice/LLM agents, signature editors, automated testing, billing refactors, and cloud integrations."
          />

          <div className="mb-10 md:mb-12">
            <Link
              href="/portfolio"
              className="inline-flex min-h-12 items-center gap-2 border border-[var(--accent-ink)]/60 bg-[var(--accent-soft)] px-5 text-sm font-semibold text-[var(--accent-ink-strong)] transition-colors hover:bg-[var(--accent-solid)] hover:text-[var(--accent-on-solid)]"
            >
              <span>Open Full Portfolio ({PORTFOLIO_PROJECTS.length})</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {featuredProjects.map((project) => (
            <PortfolioCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
}
