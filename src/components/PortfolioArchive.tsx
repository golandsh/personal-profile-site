"use client";

import { type ReactElement, useMemo, useState } from "react";
import { PortfolioCard } from "@/components/PortfolioCard";
import type { PortfolioDomain, PortfolioProject } from "@/types/profile";

type PortfolioFilter = "All" | PortfolioDomain;

const DOMAIN_FILTERS: readonly PortfolioFilter[] = [
  "All",
  "Architecture",
  "Payments",
  "Cloud & Serverless",
  "AI Workflows",
];

export function filterPortfolioProjects(
  projects: readonly PortfolioProject[],
  filter: PortfolioFilter,
): readonly PortfolioProject[] {
  if (filter === "All") {
    return projects;
  }
  return projects.filter((project) => project.domain === filter);
}

interface PortfolioArchiveProps {
  readonly projects: readonly PortfolioProject[];
}

export function PortfolioArchive({
  projects,
}: PortfolioArchiveProps): ReactElement {
  const [selectedDomain, setSelectedDomain] = useState<PortfolioFilter>("All");

  const filteredProjects = useMemo(
    () => filterPortfolioProjects(projects, selectedDomain),
    [projects, selectedDomain],
  );

  return (
    <section>
      <h2 className="visually-hidden">Project Catalog</h2>
      <div
        role="group"
        aria-label="Filter portfolio items by domain"
        className="mb-8 flex flex-wrap gap-2"
      >
        {DOMAIN_FILTERS.map((domain) => {
          const active = selectedDomain === domain;
          const count = filterPortfolioProjects(projects, domain).length;

          return (
            <button
              key={domain}
              type="button"
              aria-pressed={active}
              onClick={() => setSelectedDomain(domain)}
              className={`inline-flex min-h-11 items-center gap-2 border px-3.5 font-mono text-xs uppercase tracking-[0.08em] transition-colors ${
                active
                  ? "border-cyan-300 bg-cyan-400/15 text-cyan-200"
                  : "border-slate-800 bg-slate-950/70 text-slate-300 hover:border-slate-600 hover:text-white"
              }`}
            >
              <span>{domain}</span>
              <span
                className={`px-1.5 py-0.5 text-[10px] ${
                  active
                    ? "bg-cyan-300 font-bold text-slate-950"
                    : "bg-slate-800 text-slate-300"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {filteredProjects.length === 0 ? (
        <div className="border border-slate-800 bg-slate-950/70 p-8 text-center font-mono text-sm text-slate-400">
          No portfolio items in this category yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {filteredProjects.map((project) => (
            <PortfolioCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </section>
  );
}
