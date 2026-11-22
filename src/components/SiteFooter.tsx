import Link from "next/link";
import type { ReactElement } from "react";
import { PROFILE } from "@/data/profile";

export function SiteFooter(): ReactElement {
  return (
    <footer className="border-t border-[var(--surface-hairline)] bg-[var(--surface-footer)] py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-5 sm:flex-row sm:items-center sm:px-8">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-xs font-semibold text-[var(--accent-ink)]">
              {PROFILE.monogram}
            </span>
            <span className="font-display text-sm font-semibold text-[var(--ink-primary)]">
              {PROFILE.name}
            </span>
          </div>
          <p className="mt-1 font-mono text-xs text-[var(--ink-muted)]">
            © 2026 {PROFILE.name} · {PROFILE.location} ({PROFILE.coordinates})
          </p>
        </div>

        <nav aria-label="Footer">
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-xs uppercase tracking-[0.12em] text-[var(--ink-muted)]">
            <li>
              <Link href="/#about" className="py-2 transition-colors hover:text-[var(--accent-ink)]">
                About
              </Link>
            </li>
            <li>
              <Link href="/#career" className="py-2 transition-colors hover:text-[var(--accent-ink)]">
                Career
              </Link>
            </li>
            <li>
              <Link href="/portfolio" className="py-2 transition-colors hover:text-[var(--accent-ink)]">
                Portfolio
              </Link>
            </li>
            <li>
              <Link href="/private-life" className="py-2 transition-colors hover:text-[var(--accent-ink)]">
                Private Life
              </Link>
            </li>
            <li>
              <a
                href={PROFILE.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2 transition-colors hover:text-[var(--accent-ink)]"
              >
                GitHub
              </a>
            </li>
            <li>
              <a
                href={PROFILE.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2 transition-colors hover:text-[var(--accent-ink)]"
              >
                LinkedIn
              </a>
            </li>
            <li>
              <a
                href={`mailto:${PROFILE.email}`}
                className="py-2 transition-colors hover:text-[var(--accent-ink)]"
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
