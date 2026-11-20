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
                title="Let's build something built to last."
                subtitle="Available for staff/principal engineering, technical leadership, complex architecture modernization, and AI-accelerated product delivery."
              />
            </div>

            <div className="flex flex-col gap-3.5 lg:col-span-5">
              <a
                href={`mailto:${PROFILE.email}`}
                className="inline-flex min-h-13 items-center justify-between bg-cyan-300 px-5 text-sm font-bold text-slate-950 transition-colors hover:bg-[#b8ff3b]"
              >
                <span className="inline-flex items-center gap-2.5">
                  <Mail className="h-4 w-4" aria-hidden="true" />
                  <span>{PROFILE.email}</span>
                </span>
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </a>

              <div className="grid grid-cols-1 items-start gap-3 sm:grid-cols-2">
                <CopyEmailButton email={PROFILE.email} />

                <a
                  href={PROFILE.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-12 items-center justify-center gap-2 border border-slate-700 bg-slate-950/80 px-4 font-mono text-xs uppercase tracking-[0.12em] text-slate-200 transition-colors hover:border-cyan-400/70 hover:text-cyan-200"
                >
                  <span>LinkedIn</span>
                  <ArrowUpRight
                    className="h-4 w-4 text-cyan-300"
                    aria-hidden="true"
                  />
                </a>
              </div>

              <p className="font-mono text-xs text-slate-400">
                {PROFILE.location} · {PROFILE.languages.join(" / ")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
