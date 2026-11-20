import type { ReactElement } from "react";
import { SectionHeading } from "@/components/SectionHeading";
import { PROFILE } from "@/data/profile";

export function CapabilitiesMatrix(): ReactElement {
  return (
    <section
      id="capabilities"
      className="border-b border-slate-800/80 py-20 sm:py-24"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          index="03"
          eyebrow="Technical Matrix"
          title="Full-spectrum engineering stack."
          subtitle="Spanning modern TypeScript frontends, payment & CRM backends, serverless cloud architectures, and AI-accelerated delivery."
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PROFILE.capabilities.map((group) => (
            <article
              key={group.id}
              className="dossier-card corner-accent reveal-on-scroll flex flex-col p-6"
            >
              <header className="border-b border-slate-800/80 pb-4">
                <span className="font-mono text-[11px] tracking-[0.2em] text-cyan-300">
                  {group.code}
                </span>
                <h3 className="mt-1.5 font-[family-name:var(--font-display)] text-lg font-semibold tracking-[-0.02em] text-slate-50">
                  {group.title}
                </h3>
              </header>

              <ul className="mt-4 space-y-2.5 text-sm text-slate-300">
                {group.items.map((item) => (
                  <li key={item} className="flex items-center gap-2.5">
                    <span
                      aria-hidden="true"
                      className="h-1 w-2.5 shrink-0 bg-cyan-400/70"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
