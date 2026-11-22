import { ArrowUpRight, Mail } from "lucide-react";
import type { ReactElement } from "react";
import { CopyEmailButton } from "@/components/CopyEmailButton";
import { SectionHeading } from "@/components/SectionHeading";
import { PROFILE } from "@/data/profile";

export function ContactSection(): ReactElement {
  return (
    <section id="contact" className="py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="dossier-card corner-accent p-7 sm:p-10 lg:p-12">
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <SectionHeading
                index="05"
                eyebrow="Initiate Contact"
                title="Happy to connect."
                subtitle="Open to senior full-stack, technical lead, and backend/cloud architecture conversations—feel free to reach out anytime."
              />
            </div>

            <div className="flex flex-col gap-3.5 lg:col-span-5">
              <a
                href={`mailto:${PROFILE.email}`}
                className="inline-flex min-h-13 items-center justify-between bg-[var(--accent-solid)] px-5 text-sm font-bold text-[var(--accent-on-solid)] transition-colors hover:bg-[var(--accent-solid-hover)]"
              >
                <span className="inline-flex items-center gap-2.5">
                  <Mail className="h-4 w-4" aria-hidden="true" />
                  <span>{PROFILE.email}</span>
                </span>
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </a>

              <div className="grid grid-cols-1 items-start gap-3 sm:grid-cols-3">
                <CopyEmailButton email={PROFILE.email} />

                <a
                  href={PROFILE.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-12 items-center justify-center gap-1.5 border border-[var(--surface-hairline)] bg-[var(--surface-chip)] px-3.5 font-mono text-xs uppercase tracking-[0.12em] text-[var(--ink-primary)] transition-colors hover:border-[var(--accent-ink)] hover:text-[var(--accent-ink)]"
                >
                  <span>LinkedIn</span>
                  <ArrowUpRight
                    className="h-4 w-4 text-[var(--accent-ink)]"
                    aria-hidden="true"
                  />
                </a>

                <a
                  href={PROFILE.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-12 items-center justify-center gap-1.5 border border-[var(--surface-hairline)] bg-[var(--surface-chip)] px-3.5 font-mono text-xs uppercase tracking-[0.12em] text-[var(--ink-primary)] transition-colors hover:border-[var(--accent-ink)] hover:text-[var(--accent-ink)]"
                >
                  <span>GitHub</span>
                  <ArrowUpRight
                    className="h-4 w-4 text-[var(--accent-ink)]"
                    aria-hidden="true"
                  />
                </a>
              </div>

              <p className="font-mono text-xs text-[var(--ink-muted)]">
                {PROFILE.location} · {PROFILE.languages.join(" / ")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
