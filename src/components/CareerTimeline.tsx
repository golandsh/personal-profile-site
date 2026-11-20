"use client";

import { Calendar, MapPin } from "lucide-react";
import { type ReactElement, useMemo, useState } from "react";
import { SectionHeading } from "@/components/SectionHeading";
import type { CareerFocus, CareerRole } from "@/types/profile";

type CareerFilter = "all" | CareerFocus;

interface FilterOption {
  readonly id: CareerFilter;
  readonly label: string;
}

const FILTER_OPTIONS: readonly FilterOption[] = [
  { id: "all", label: "All Roles" },
  { id: "leadership", label: "Leadership & Scale" },
  { id: "cloud-payments", label: "Cloud & Payments" },
  { id: "frontend-product", label: "Frontend & Product" },
];

export function filterCareerRoles(
  roles: readonly CareerRole[],
  filter: CareerFilter,
): readonly CareerRole[] {
  if (filter === "all") {
    return roles;
  }
  return roles.filter((role) => role.focusAreas.includes(filter));
}

interface CareerTimelineProps {
  readonly roles: readonly CareerRole[];
}

export function CareerTimeline({ roles }: CareerTimelineProps): ReactElement {
  const [activeFilter, setActiveFilter] = useState<CareerFilter>("all");

  const visibleRoles = useMemo(
    () => filterCareerRoles(roles, activeFilter),
    [roles, activeFilter],
  );

  return (
    <section
      id="career"
      className="border-b border-slate-800/80 py-20 sm:py-24"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <SectionHeading
            index="02"
            eyebrow="Career Journey"
            title="20 years of shipping under pressure."
            subtitle="From pioneering .NET enterprise migrations to scaling a Kyiv engineering division, integrating national toll roads, and owning core SaaS editor & payment platforms."
          />

          <div
            role="group"
            aria-label="Filter career roles by focus area"
            className="mb-10 flex flex-wrap gap-2 md:mb-12"
          >
            {FILTER_OPTIONS.map((option) => {
              const selected = activeFilter === option.id;
              const count = filterCareerRoles(roles, option.id).length;

              return (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setActiveFilter(option.id)}
                  className={`inline-flex min-h-11 items-center gap-2 border px-3.5 font-mono text-xs tracking-[0.08em] uppercase transition-colors ${
                    selected
                      ? "border-cyan-300 bg-cyan-400/15 text-cyan-200"
                      : "border-slate-800 bg-slate-950/70 text-slate-300 hover:border-slate-600 hover:text-white"
                  }`}
                >
                  <span>{option.label}</span>
                  <span
                    className={`px-1.5 py-0.5 text-[10px] ${
                      selected
                        ? "bg-cyan-300 text-slate-950 font-bold"
                        : "bg-slate-800 text-slate-300"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <ol className="relative space-y-6 before:absolute before:inset-y-2 before:left-[11px] before:hidden before:w-px before:bg-gradient-to-b before:from-cyan-400/60 before:via-slate-700/80 before:to-transparent md:space-y-8 md:pl-10 md:before:block">
          {visibleRoles.map((entry) => (
            <li key={entry.id} className="relative">
              <span
                aria-hidden="true"
                className={`absolute -left-10 top-7 hidden h-6 w-6 items-center justify-center border bg-[#07090d] md:flex ${
                  entry.featured
                    ? "border-cyan-400/80 shadow-[0_0_16px_rgba(34,211,238,0.35)]"
                    : "border-slate-700"
                }`}
              >
                <span
                  className={`h-2 w-2 ${
                    entry.featured ? "bg-cyan-300" : "bg-slate-500"
                  }`}
                />
              </span>

              <article className="dossier-card corner-accent reveal-on-scroll p-6 sm:p-7">
                <header className="dossier-card-split border-b border-slate-800/80 pb-5">
                  <div>
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h3 className="font-[family-name:var(--font-display)] text-xl font-bold tracking-[-0.02em] text-slate-50 sm:text-2xl">
                        {entry.company}
                      </h3>
                      {entry.featured ? (
                        <span className="border border-[#b8ff3b]/40 bg-[#b8ff3b]/10 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[#d5ff82]">
                          Flagship Tenure
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-base font-medium text-cyan-300">
                      {entry.role}
                    </p>
                  </div>

                  <div className="flex flex-col gap-1 font-mono text-xs text-slate-300 sm:items-end">
                    <span className="inline-flex items-center gap-1.5 text-slate-100">
                      <Calendar
                        className="h-3.5 w-3.5 text-cyan-400"
                        aria-hidden="true"
                      />
                      {entry.period}
                    </span>
                    <span className="text-slate-400">
                      {entry.duration}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-slate-400">
                      <MapPin
                        className="h-3.5 w-3.5 text-slate-500"
                        aria-hidden="true"
                      />
                      {entry.location}
                    </span>
                  </div>
                </header>

                <div className="mt-5 space-y-4">
                  <p className="text-sm leading-relaxed text-slate-200 sm:text-base">
                    {entry.summary}
                  </p>

                  <ul className="space-y-2.5 text-sm leading-relaxed text-slate-300">
                    {entry.highlights.map((bullet, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span
                          aria-hidden="true"
                          className="mt-2 h-1.5 w-1.5 shrink-0 bg-cyan-400"
                        />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {entry.technologies.length > 0 ? (
                  <footer className="mt-6 border-t border-slate-800/80 pt-4">
                    <ul
                      aria-label={`Technologies used at ${entry.company}`}
                      className="flex flex-wrap gap-2"
                    >
                      {entry.technologies.map((tech) => (
                        <li
                          key={tech}
                          className="border border-slate-800 bg-slate-950/80 px-2.5 py-1 font-mono text-[11px] text-slate-300"
                        >
                          {tech}
                        </li>
                      ))}
                    </ul>
                  </footer>
                ) : null}
              </article>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
