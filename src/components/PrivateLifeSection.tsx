import { Camera, Compass } from "lucide-react";
import type { ReactElement } from "react";

export function PrivateLifeSection(): ReactElement {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
      <article className="dossier-card corner-accent flex flex-col justify-between p-6 sm:p-7">
        <div>
          <div className="flex items-center justify-between gap-2 border-b border-[var(--surface-hairline)] pb-4">
            <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.16em] text-[var(--accent-ink)]">
              <Compass className="h-4 w-4" aria-hidden="true" />
              <span>Hobbies &amp; Interests</span>
            </span>
            <span className="border border-[var(--surface-hairline)] bg-[var(--surface-panel)] px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--ink-muted)]">
              Under Construction
            </span>
          </div>

          <h2 className="mt-5 font-display text-xl font-bold tracking-[-0.02em] text-[var(--ink-primary)]">
            Hobbies Section Under Construction
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[var(--ink-secondary)]">
            This space is currently under construction. Soon it will share the
            hobbies, side interests, and activities I enjoy outside of software
            engineering.
          </p>
        </div>

        <footer className="mt-6 border-t border-[var(--surface-hairline)] pt-4 font-mono text-xs text-[var(--ink-muted)]">
          Status: Under construction — content will be added soon.
        </footer>
      </article>

      <article className="dossier-card corner-accent flex flex-col justify-between p-6 sm:p-7">
        <div>
          <div className="flex items-center justify-between gap-2 border-b border-[var(--surface-hairline)] pb-4">
            <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.16em] text-[var(--accent-ink)]">
              <Camera className="h-4 w-4" aria-hidden="true" />
              <span>Life &amp; Photos</span>
            </span>
            <span className="border border-[var(--surface-hairline)] bg-[var(--surface-panel)] px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--ink-muted)]">
              Under Construction
            </span>
          </div>

          <h2 className="mt-5 font-display text-xl font-bold tracking-[-0.02em] text-[var(--ink-primary)]">
            Photo Gallery Under Construction
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[var(--ink-secondary)]">
            Personal photos and snapshots from everyday life are currently being
            curated and will be published here soon.
          </p>
        </div>

        <footer className="mt-6 border-t border-[var(--surface-hairline)] pt-4 font-mono text-xs text-[var(--ink-muted)]">
          Status: Under construction — photos will be added soon.
        </footer>
      </article>
    </div>
  );
}
