import type { ReactElement } from "react";

interface SectionHeadingProps {
  readonly index: string;
  readonly eyebrow: string;
  readonly title: string;
  readonly subtitle?: string;
}

export function SectionHeading({
  index,
  eyebrow,
  title,
  subtitle,
}: SectionHeadingProps): ReactElement {
  return (
    <div className="mb-10 flex flex-col gap-3 md:mb-12">
      <div className="flex items-center gap-3 font-mono text-xs tracking-[0.22em] uppercase text-[var(--accent-ink)]">
        <span className="inline-flex h-6 items-center border border-[var(--accent-ink)]/35 bg-[var(--accent-soft)] px-2 font-semibold text-[var(--accent-ink-strong)]">
          {index}
        </span>
        <span aria-hidden="true" className="text-[var(--ink-muted)]">
          {"//"}
        </span>
        <span>{eyebrow}</span>
      </div>
      <h2 className="font-display text-3xl font-bold tracking-[-0.03em] text-[var(--ink-primary)] sm:text-4xl">
        {title}
      </h2>
      {subtitle ? (
        <p className="max-w-2xl text-base leading-relaxed text-[var(--ink-secondary)] sm:text-lg">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
