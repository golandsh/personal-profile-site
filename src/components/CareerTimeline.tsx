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
      className="border-b border-[var(--surface-hairline)] py-20 sm:py-24"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <SectionHeading
            index="02"
            eyebrow="Career Journey"
            title="Experience across the stack."
            subtitle="From .NET enterprise systems and building a team in Kyiv to AWS serverless integrations, agronomy pipelines, and SaaS product & payment ownership."
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
                      ? "border-[var(--accent-ink)] bg-[var(--accent-soft)] text-[var(--accent-ink-strong)]"
                      : "border-[var(--surface-hairline)] bg-[var(--surface-panel)] text-[var(--ink-secondary)] hover:border-[var(--accent-ink)]/60 hover:text-[var(--ink-primary)]"
                  }`}
                >
                  <span>{option.label}</span>
                  <span
                    className={`px-1.5 py-0.5 text-[10px] ${
                      selected
                        ? "bg-[var(--accent-solid)] font-bold text-[var(--accent-on-solid)]"
                        : "bg-[var(--surface-chip)] text-[var(--ink-muted)]"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <ol className="relative space-y-6 before:absolute before:inset-y-2 before:left-[11px] before:hidden before:w-px before:bg-gradient-to-b before:from-[var(--accent-ink)]/60 before:via-[var(--surface-hairline)] before:to-transparent md:space-y-8 md:pl-10 md:before:block">
          {visibleRoles.map((entry) => (
            <li key={entry.id} className="relative">
              <span
                aria-hidden="true"
                className={`absolute -left-10 top-7 hidden h-6 w-6 items-center justify-center border bg-[var(--surface-obsidian)] md:flex ${
                  entry.featured
                    ? "border-[var(--accent-ink)]/80"
                    : "border-[var(--surface-hairline)]"
                }`}
              >
                <span
                  className={`h-2 w-2 ${
                    entry.featured ? "bg-[var(--accent-ink)]" : "bg-[var(--ink-muted)]"
                  }`}
                />
              </span>

              <article className="dossier-card corner-accent reveal-on-scroll p-6 sm:p-7">
                <header className="dossier-card-split border-b border-[var(--surface-hairline)] pb-5">
                  <div>
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h3 className="font-display text-xl font-bold tracking-[-0.02em] text-[var(--ink-primary)] sm:text-2xl">
                        {entry.company}
                      </h3>
                      {entry.featured ? (
                        <span className="border border-[var(--accent-volt)]/40 bg-[var(--accent-volt-soft)] px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--accent-volt)]">
                          Flagship Tenure
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-base font-medium text-[var(--accent-ink)]">
                      {entry.role}
                    </p>
                  </div>

                  <div className="flex flex-col gap-1 font-mono text-xs text-[var(--ink-secondary)] sm:items-end">
                    <span className="inline-flex items-center gap-1.5 text-[var(--ink-primary)]">
                      <Calendar
                        className="h-3.5 w-3.5 text-[var(--accent-ink)]"
                        aria-hidden="true"
                      />
                      {entry.period}
                    </span>
                    <span className="text-[var(--ink-muted)]">
                      {entry.duration}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-[var(--ink-muted)]">
                      <MapPin
                        className="h-3.5 w-3.5 opacity-75"
                        aria-hidden="true"
                      />
                      {entry.location}
                    </span>
                  </div>
                </header>

                <div className="mt-5 space-y-4">
                  <p className="text-sm leading-relaxed text-[var(--ink-primary)] sm:text-base">
                    {entry.summary}
                  </p>

                  <ul className="space-y-2.5 text-sm leading-relaxed text-[var(--ink-secondary)]">
                    {entry.highlights.map((bullet, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span
                          aria-hidden="true"
                          className="mt-2 h-1.5 w-1.5 shrink-0 bg-[var(--accent-ink)]"
                        />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {entry.technologies.length > 0 ? (
                  <footer className="mt-6 border-t border-[var(--surface-hairline)] pt-4">
                    <ul
                      aria-label={`Technologies used at ${entry.company}`}
                      className="flex flex-wrap gap-2"
                    >
                      {entry.technologies.map((tech) => (
                        <li
                          key={tech}
                          className="border border-[var(--surface-hairline)] bg-[var(--surface-panel)] px-2.5 py-1 font-mono text-[11px] text-[var(--ink-secondary)]"
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
