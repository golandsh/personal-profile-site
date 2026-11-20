import { ArrowDownRight, ArrowUpRight, FolderGit2, MapPin } from "lucide-react";
import Link from "next/link";
import type { ReactElement } from "react";
import { OpenDigitalTwinButton } from "@/components/OpenDigitalTwinButton";
import { PROFILE } from "@/data/profile";

export function HeroSection(): ReactElement {
  return (
    <section className="relative border-b border-slate-800/80 py-16 sm:py-24 lg:py-28">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-start gap-12 px-5 sm:px-8 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-7">
          <div className="mb-6 inline-flex items-center gap-2.5 border border-slate-700/80 bg-slate-900/80 px-3.5 py-1.5 font-mono text-xs tracking-[0.14em] uppercase text-slate-200">
            <span className="status-dot" aria-hidden="true" />
            <span>{PROFILE.availabilityStatus}</span>
          </div>

          <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold leading-[1.04] tracking-[-0.04em] text-slate-50 sm:text-6xl lg:text-[4.15rem]">
            {PROFILE.name}
            <span className="mt-3 block bg-gradient-to-r from-cyan-300 via-sky-200 to-[#b8ff3b] bg-clip-text text-2xl font-semibold leading-[1.18] tracking-[-0.025em] text-transparent sm:text-3xl lg:text-[2.1rem]">
              {PROFILE.tagline}
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
            {PROFILE.heroLead}
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3.5">
            <Link
              href="/#career"
              className="inline-flex min-h-12 items-center gap-2 bg-cyan-300 px-6 text-sm font-bold tracking-[0.04em] text-slate-950 transition-colors hover:bg-[#b8ff3b]"
            >
              <span>Explore Career Journey</span>
              <ArrowDownRight className="h-4 w-4" aria-hidden="true" />
            </Link>

            <OpenDigitalTwinButton />

            <Link
              href="/portfolio"
              className="inline-flex min-h-12 items-center gap-2 border border-slate-700 bg-slate-900/80 px-5 text-sm font-semibold text-slate-100 transition-colors hover:border-cyan-400/70 hover:text-cyan-200"
            >
              <FolderGit2 className="h-4 w-4 text-cyan-300" aria-hidden="true" />
              <span>Portfolio Archive</span>
            </Link>

            <a
              href={PROFILE.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 items-center gap-1.5 border border-transparent px-3 text-sm font-medium text-slate-300 transition-colors hover:text-cyan-300"
            >
              <span>LinkedIn</span>
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-slate-800/90 pt-6 font-mono text-xs text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-cyan-400" aria-hidden="true" />
              {PROFILE.location}
            </span>
            <span aria-hidden="true" className="hidden text-slate-700 sm:inline">
              /
            </span>
            <span>{PROFILE.coordinates}</span>
            <span aria-hidden="true" className="hidden text-slate-700 sm:inline">
              /
            </span>
            <span>{PROFILE.languages.join(" · ")}</span>
          </div>
        </div>

        <aside
          aria-label="Executive Engineering Dossier"
          className="dossier-card corner-accent lg:col-span-5"
        >
          <div className="flex items-center justify-between border-b border-slate-800/90 px-5 py-3.5 font-mono text-[11px] tracking-[0.18em] uppercase text-slate-400">
            <span className="text-cyan-300">{"//"} EXECUTIVE.SPEC</span>
            <span>REV 2026.07</span>
          </div>

          <div className="grid grid-cols-1 divide-y divide-slate-800/80 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
            {PROFILE.metrics.map((metric, index) => (
              <div
                key={metric.id}
                className={`p-5 ${index >= 2 ? "sm:border-t sm:border-slate-800/80" : ""}`}
              >
                <div className="font-mono text-2xl font-semibold tracking-tight text-slate-50">
                  {metric.value}
                </div>
                <div className="mt-1 text-xs font-semibold tracking-[0.08em] uppercase text-cyan-300">
                  {metric.label}
                </div>
                <p className="mt-2 text-xs leading-relaxed text-slate-400">
                  {metric.detail}
                </p>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-800/90 bg-slate-950/60 px-5 py-4">
            <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-slate-400">
              Signature Domains
            </div>
            <ul className="mt-2.5 flex flex-wrap gap-2">
              {[
                "Recurly Payments",
                "AWS Serverless",
                "Editor Engines",
                "Enterprise CRMs",
                "Cursor / Claude Code",
              ].map((tag) => (
                <li
                  key={tag}
                  className="border border-slate-700/80 bg-slate-900 px-2.5 py-1 font-mono text-[11px] text-slate-200"
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
