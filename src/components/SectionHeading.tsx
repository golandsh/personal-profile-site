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
      <div className="flex items-center gap-3 font-mono text-xs tracking-[0.22em] uppercase text-cyan-300">
        <span className="inline-flex h-6 items-center border border-cyan-400/30 bg-cyan-400/10 px-2 font-semibold text-cyan-200">
          {index}
        </span>
        <span aria-hidden="true" className="text-slate-600">
          {"//"}
        </span>
        <span>{eyebrow}</span>
      </div>
      <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-[-0.03em] text-slate-50 sm:text-4xl">
        {title}
      </h2>
      {subtitle ? (
        <p className="max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
