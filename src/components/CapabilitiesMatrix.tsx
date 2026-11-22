import type { ReactElement } from "react";
import { SectionHeading } from "@/components/SectionHeading";
import { PROFILE } from "@/data/profile";

export function CapabilitiesMatrix(): ReactElement {
  return (
    <section
      id="capabilities"
      className="border-b border-[var(--surface-hairline)] py-20 sm:py-24"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          index="03"
          eyebrow="Technical Matrix"
          title="Full-spectrum engineering stack."
          subtitle="Spanning TypeScript & Java/C# backends, payment & CRM integrations, AWS/GCP cloud services, and practical AI tooling."
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PROFILE.capabilities.map((group) => (
            <article
              key={group.id}
              className="dossier-card corner-accent reveal-on-scroll flex flex-col p-6"
            >
              <header className="border-b border-[var(--surface-hairline)] pb-4">
                <span className="font-mono text-[11px] tracking-[0.2em] text-[var(--accent-ink)]">
                  {group.code}
                </span>
                <h3 className="mt-1.5 font-display text-lg font-semibold tracking-[-0.02em] text-[var(--ink-primary)]">
                  {group.title}
                </h3>
              </header>

              <ul className="mt-4 space-y-2.5 text-sm text-[var(--ink-secondary)]">
                {group.items.map((item) => (
                  <li key={item} className="flex items-center gap-2.5">
                    <span
                      aria-hidden="true"
                      className="h-1 w-2.5 shrink-0 bg-[var(--accent-ink)]/70"
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
