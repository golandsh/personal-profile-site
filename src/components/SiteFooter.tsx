import Link from "next/link";
import type { ReactElement } from "react";
import { PROFILE } from "@/data/profile";

export function SiteFooter(): ReactElement {
  return (
    <footer className="border-t border-slate-800/80 bg-[#05070b] py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-5 sm:flex-row sm:items-center sm:px-8">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-xs font-semibold text-cyan-300">
              {PROFILE.monogram}
            </span>
            <span className="font-[family-name:var(--font-display)] text-sm font-semibold text-slate-100">
              {PROFILE.name}
            </span>
          </div>
          <p className="mt-1 font-mono text-xs text-slate-400">
            © 2026 {PROFILE.name} · {PROFILE.location} ({PROFILE.coordinates})
          </p>
        </div>

        <nav aria-label="Footer">
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-xs uppercase tracking-[0.12em] text-slate-400">
            <li>
              <Link href="/#about" className="py-2 transition-colors hover:text-cyan-300">
                About
              </Link>
            </li>
            <li>
              <Link href="/#career" className="py-2 transition-colors hover:text-cyan-300">
                Career
              </Link>
            </li>
            <li>
              <Link href="/portfolio" className="py-2 transition-colors hover:text-cyan-300">
                Portfolio
              </Link>
            </li>
            <li>
              <a
                href={PROFILE.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2 transition-colors hover:text-cyan-300"
              >
                LinkedIn
              </a>
            </li>
            <li>
              <a
                href={`mailto:${PROFILE.email}`}
                className="py-2 transition-colors hover:text-cyan-300"
              >
                Email
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
