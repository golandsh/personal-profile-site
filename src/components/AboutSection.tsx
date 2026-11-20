import { GraduationCap, Languages } from "lucide-react";
import type { ReactElement } from "react";
import { SectionHeading } from "@/components/SectionHeading";
import { PROFILE } from "@/data/profile";

export function AboutSection(): ReactElement {
  return (
    <section
      id="about"
      className="border-b border-slate-800/80 py-20 sm:py-24"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          index="01"
          eyebrow="About Me"
          title="Enterprise depth. Startup tempo."
          subtitle="Two decades of turning complex domain constraints—payments, national infrastructure, broadcast engines, and visual editors—into durable software."
        />

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="flex flex-col gap-5 lg:col-span-5">
            {PROFILE.aboutParagraphs.map((paragraph, index) => (
              <p
                key={index}
                className="text-base leading-relaxed text-slate-300"
              >
                {paragraph}
              </p>
            ))}

            <div className="mt-2 border border-slate-800 bg-slate-950/70 p-5">
              <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-cyan-300">
                <GraduationCap className="h-4 w-4" aria-hidden="true" />
                <span>Education</span>
              </div>
              <ul className="mt-4 space-y-3.5">
                {PROFILE.education.map((entry) => (
                  <li
                    key={entry.id}
                    className="border-l-2 border-slate-700 pl-3.5"
                  >
                    <div className="text-sm font-semibold text-slate-100">
                      {entry.institution}
                    </div>
                    <div className="text-xs text-slate-300">
                      {entry.degree} · {entry.field}
                    </div>
                    <div className="mt-0.5 font-mono text-[11px] text-slate-400">
                      {entry.period}
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-slate-800/90 pt-4">
                <span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-slate-400">
                  <Languages className="h-3.5 w-3.5 text-cyan-300" aria-hidden="true" />
                  Languages
                </span>
                <div className="flex flex-wrap gap-2">
                  {PROFILE.languages.map((language) => (
                    <span
                      key={language}
                      className="border border-slate-800 bg-slate-900 px-2.5 py-0.5 font-mono text-xs text-slate-200"
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
                  <span className="font-mono text-xs tracking-[0.2em] text-cyan-300">
                    PILLAR {pillar.index}
                  </span>
                  <h3 className="mt-2.5 font-[family-name:var(--font-display)] text-lg font-semibold tracking-[-0.02em] text-slate-50">
                    {pillar.title}
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-slate-300">
                    {pillar.description}
                  </p>
                </div>

                <footer className="mt-5 border-t border-slate-800/90 pt-3 font-mono text-[11px] tracking-[0.06em] text-slate-400">
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
