import { GraduationCap, Languages } from "lucide-react";
import type { ReactElement } from "react";
import { SectionHeading } from "@/components/SectionHeading";
import { PROFILE } from "@/data/profile";

export function AboutSection(): ReactElement {
  return (
    <section
      id="about"
      className="border-b border-[var(--surface-hairline)] py-20 sm:py-24"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          index="01"
          eyebrow="About Me"
          title="Practical engineering, steady delivery."
          subtitle="Turning everyday product and backend challenges—payments, agritech data pipelines, editors, and integrations—into clean, reliable software."
        />

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="flex flex-col gap-5 lg:col-span-5">
            {PROFILE.aboutParagraphs.map((paragraph, index) => (
              <p
                key={index}
                className="text-base leading-relaxed text-[var(--ink-secondary)]"
              >
                {paragraph}
              </p>
            ))}

            <div className="mt-2 border border-[var(--surface-hairline)] bg-[var(--surface-panel)] p-5">
              <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-[var(--accent-ink)]">
                <GraduationCap className="h-4 w-4" aria-hidden="true" />
                <span>Education &amp; Training</span>
              </div>
              <ul className="mt-4 space-y-3.5">
                {PROFILE.education.map((entry) => (
                  <li
                    key={entry.id}
                    className="border-l-2 border-[var(--surface-hairline)] pl-3.5"
                  >
                    <div className="text-sm font-semibold text-[var(--ink-primary)]">
                      {entry.institution}
                    </div>
                    <div className="text-xs text-[var(--ink-secondary)]">
                      {entry.degree} · {entry.field}
                    </div>
                    <div className="mt-0.5 font-mono text-[11px] text-[var(--ink-muted)]">
                      {entry.period}
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-[var(--surface-hairline)] pt-4">
                <span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--ink-muted)]">
                  <Languages className="h-3.5 w-3.5 text-[var(--accent-ink)]" aria-hidden="true" />
                  Languages
                </span>
                <div className="flex flex-wrap gap-2">
                  {PROFILE.languages.map((language) => (
                    <span
                      key={language}
                      className="border border-[var(--surface-hairline)] bg-[var(--surface-chip)] px-2.5 py-0.5 font-mono text-xs text-[var(--ink-secondary)]"
                    >
                      {language}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-7">
            {PROFILE.pillars.map((pillar) => (
              <article
                key={pillar.id}
                className="dossier-card corner-accent reveal-on-scroll flex flex-col justify-between p-6"
              >
                <div>
                  <span className="font-mono text-xs tracking-[0.2em] text-[var(--accent-ink)]">
                    PILLAR {pillar.index}
                  </span>
                  <h3 className="mt-2.5 font-display text-lg font-semibold tracking-[-0.02em] text-[var(--ink-primary)]">
                    {pillar.title}
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-[var(--ink-secondary)]">
                    {pillar.description}
                  </p>
                </div>

                <footer className="mt-5 border-t border-[var(--surface-hairline)] pt-3 font-mono text-[11px] tracking-[0.06em] text-[var(--ink-muted)]">
                  {pillar.proofPoint}
                </footer>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
