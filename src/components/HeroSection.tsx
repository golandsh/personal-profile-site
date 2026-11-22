import { ArrowDownRight, FolderGit2, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactElement } from "react";
import { OpenDigitalTwinButton } from "@/components/OpenDigitalTwinButton";
import { PROFILE } from "@/data/profile";

export function HeroSection(): ReactElement {
  return (
    <section className="relative border-b border-[var(--surface-hairline)] py-16 sm:py-24 lg:py-28">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-start gap-12 px-5 sm:px-8 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-7">
          <div className="mb-6 inline-flex items-center gap-2.5 border border-[var(--surface-hairline)] bg-[var(--surface-chip)] px-3.5 py-1.5 font-mono text-xs tracking-[0.14em] uppercase text-[var(--ink-primary)]">
            <span className="status-dot" aria-hidden="true" />
            <span>{PROFILE.availabilityStatus}</span>
          </div>

          <h1 className="font-display text-4xl font-bold leading-[1.04] tracking-[-0.04em] text-[var(--ink-primary)] sm:text-6xl lg:text-[4.15rem]">
            {PROFILE.name}
            <span className="mt-3 block text-2xl font-semibold leading-[1.18] tracking-[-0.025em] text-[var(--accent-ink)] sm:text-3xl lg:text-[2.1rem]">
              {PROFILE.tagline}
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-relaxed text-[var(--ink-secondary)] sm:text-lg">
            {PROFILE.heroLead}
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3.5">
            <Link
              href="/#career"
              className="inline-flex min-h-12 items-center gap-2 bg-[var(--accent-solid)] px-6 text-sm font-bold tracking-[0.04em] text-[var(--accent-on-solid)] transition-colors hover:bg-[var(--accent-solid-hover)]"
            >
              <span>Explore Career Journey</span>
              <ArrowDownRight className="h-4 w-4" aria-hidden="true" />
            </Link>

            <OpenDigitalTwinButton />

            <Link
              href="/portfolio"
              className="inline-flex min-h-12 items-center gap-2 border border-[var(--surface-hairline)] bg-[var(--surface-chip)] px-5 text-sm font-semibold text-[var(--ink-primary)] transition-colors hover:border-[var(--accent-ink)] hover:text-[var(--accent-ink)]"
            >
              <FolderGit2 className="h-4 w-4 text-[var(--accent-ink)]" aria-hidden="true" />
              <span>Portfolio Archive</span>
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-[var(--surface-hairline)] pt-6 font-mono text-xs text-[var(--ink-muted)]">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-[var(--accent-ink)]" aria-hidden="true" />
              {PROFILE.location}
            </span>
            <span aria-hidden="true" className="hidden opacity-40 sm:inline">
              /
            </span>
            <span>{PROFILE.coordinates}</span>
            <span aria-hidden="true" className="hidden opacity-40 sm:inline">
              /
            </span>
            <span>{PROFILE.languages.join(" · ")}</span>
          </div>
        </div>

        <aside
          aria-label="Profile Summary Card"
          className="dossier-card corner-accent lg:col-span-5"
        >
          <div className="flex items-center justify-between gap-4 border-b border-[var(--surface-hairline)] px-5 py-4">
            <div>
              <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-[var(--accent-ink)]">
                {"//"} PROFILE.SPEC
              </div>
              <div className="mt-1 font-display text-base font-semibold text-[var(--ink-primary)]">
                {PROFILE.title}
              </div>
              <div className="mt-0.5 font-mono text-[11px] text-[var(--ink-muted)]">
                {PROFILE.location}
              </div>
            </div>

            <div className="relative h-20 w-20 shrink-0 overflow-hidden border border-[var(--accent-ink)]/50 bg-[var(--surface-panel)]">
              <Image
                src={PROFILE.portraitPath}
                alt={PROFILE.name}
                width={160}
                height={160}
                priority
                className="h-full w-full object-cover object-[50%_26%]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 divide-y divide-[var(--surface-hairline)] sm:grid-cols-2 sm:divide-x sm:divide-y-0">
            {PROFILE.metrics.map((metric, index) => (
              <div
                key={metric.id}
                className={`p-5 ${index >= 2 ? "sm:border-t sm:border-[var(--surface-hairline)]" : ""}`}
              >
                <div className="font-mono text-2xl font-semibold tracking-tight text-[var(--ink-primary)]">
                  {metric.value}
                </div>
                <div className="mt-1 text-xs font-semibold tracking-[0.08em] uppercase text-[var(--accent-ink)]">
                  {metric.label}
                </div>
                <p className="mt-2 text-xs leading-relaxed text-[var(--ink-muted)]">
                  {metric.detail}
                </p>
              </div>
            ))}
          </div>

          <div className="border-t border-[var(--surface-hairline)] bg-[var(--surface-panel)] px-5 py-4">
            <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--ink-muted)]">
              Core Focus
            </div>
            <ul className="mt-2.5 flex flex-wrap gap-2">
              {[
                "Recurly Payments",
                "AWS & GCP",
                "Editor Engines",
                "LangChain & Gemini",
                "Cursor / Claude Code",
              ].map((tag) => (
                <li
                  key={tag}
                  className="border border-[var(--surface-hairline)] bg-[var(--surface-chip)] px-2.5 py-1 font-mono text-[11px] text-[var(--ink-secondary)]"
                >
                  {tag}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </section>
  );
}
