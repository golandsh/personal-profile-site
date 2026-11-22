"use client";

import {
  ArrowUpRight,
  Clock,
  Code2,
  ExternalLink,
  FileCode2,
  X,
} from "lucide-react";
import { type MouseEvent, type ReactElement, useId, useRef } from "react";
import { isExternalHttpUrl } from "@/lib/safe-url";
import type { PortfolioProject } from "@/types/profile";

interface PortfolioCardProps {
  readonly project: PortfolioProject;
}

function renderStatusActions(
  project: PortfolioProject,
  onOpenBrief: () => void,
): ReactElement {
  switch (project.status) {
    case "live": {
      const safeLiveUrl = isExternalHttpUrl(project.liveUrl)
        ? project.liveUrl
        : null;
      const safeRepoUrl =
        project.repoUrl && isExternalHttpUrl(project.repoUrl)
          ? project.repoUrl
          : null;

      return (
        <div className="flex flex-wrap items-center gap-2.5">
          {safeLiveUrl ? (
            <a
              href={safeLiveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-1.5 bg-[var(--accent-solid)] px-4 text-xs font-bold uppercase tracking-[0.12em] text-[var(--accent-on-solid)] transition-colors hover:bg-[var(--accent-solid-hover)]"
            >
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              <span>
                Launch Live
                <span className="visually-hidden"> {project.title}</span>
              </span>
            </a>
          ) : null}
          {safeRepoUrl ? (
            <a
              href={safeRepoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-1.5 border border-[var(--surface-hairline)] px-3.5 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--ink-primary)] transition-colors hover:border-[var(--accent-ink)] hover:text-[var(--accent-ink)]"
            >
              <Code2 className="h-3.5 w-3.5" aria-hidden="true" />
              <span>
                Source
                <span className="visually-hidden"> for {project.title}</span>
              </span>
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          ) : null}
          <button
            type="button"
            onClick={onOpenBrief}
            className="inline-flex min-h-11 items-center gap-1.5 border border-[var(--surface-hairline)] bg-[var(--surface-panel)] px-3.5 font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--ink-secondary)] transition-colors hover:border-[var(--accent-ink)] hover:text-[var(--accent-ink)]"
          >
            <FileCode2 className="h-3.5 w-3.5 text-[var(--accent-ink)]" aria-hidden="true" />
            <span>
              Brief
              <span className="visually-hidden"> for {project.title}</span>
            </span>
          </button>
        </div>
      );
    }

    case "upcoming":
      return (
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--ink-muted)]">
            <Clock className="h-3.5 w-3.5 text-[var(--accent-ink)]" aria-hidden="true" />
            {project.targetRelease}
          </span>
          <button
            type="button"
            onClick={onOpenBrief}
            className="inline-flex min-h-11 items-center gap-1.5 border border-[var(--accent-ink)]/45 bg-[var(--accent-soft)] px-3.5 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--accent-ink-strong)] transition-colors hover:bg-[var(--accent-solid)] hover:text-[var(--accent-on-solid)]"
          >
            <FileCode2 className="h-3.5 w-3.5" aria-hidden="true" />
            <span>
              Architecture Brief
              <span className="visually-hidden"> for {project.title}</span>
            </span>
          </button>
        </div>
      );

    default: {
      const exhaustiveCheck: never = project;
      throw new Error(`Unhandled portfolio status: ${String(exhaustiveCheck)}`);
    }
  }
}

export function PortfolioCard({ project }: PortfolioCardProps): ReactElement {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const dialogTitleId = useId();

  const openBrief = (): void => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }
    if (typeof dialog.showModal === "function") {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      dialog.setAttribute("open", "");
    }
  };

  const closeBrief = (): void => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }
    if (typeof dialog.close === "function") {
      dialog.close();
    } else {
      dialog.removeAttribute("open");
    }
  };

  const handleBackdropClick = (event: MouseEvent<HTMLDialogElement>): void => {
    const dialog = dialogRef.current;
    if (!dialog || event.target !== dialog) {
      return;
    }
    const rect = dialog.getBoundingClientRect();
    const clickedOutside =
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom;
    if (clickedOutside || (rect.width === 0 && rect.height === 0)) {
      closeBrief();
    }
  };

  return (
    <article className="dossier-card corner-accent reveal-on-scroll flex flex-col justify-between p-6 sm:p-7">
      <div>
        <header className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--surface-hairline)] pb-4">
          <div className="flex items-center gap-2.5 font-mono text-xs">
            <span className="text-[var(--accent-ink)]">{project.code}</span>
            <span aria-hidden="true" className="text-[var(--ink-muted)]">
              /
            </span>
            <span className="uppercase tracking-[0.12em] text-[var(--ink-muted)]">
              {project.domain}
            </span>
          </div>

          <span
            className={`border px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] ${
              project.status === "live"
                ? "border-[var(--accent-volt)]/50 bg-[var(--accent-volt-soft)] text-[var(--accent-volt)]"
                : "border-[var(--accent-ink)]/35 bg-[var(--accent-soft)] text-[var(--accent-ink-strong)]"
            }`}
          >
            {project.status === "live" ? "Live Project" : "Dossier Queued"}
          </span>
        </header>

        <div className="mt-5">
          <div className="font-mono text-xs text-[var(--ink-muted)]">
            {project.organization} · {project.year}
          </div>
          <h3 className="mt-1.5 font-display text-xl font-bold tracking-[-0.02em] text-[var(--ink-primary)]">
            {project.title}
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-[var(--ink-secondary)]">
            {project.summary}
          </p>

          <p className="mt-4 border-l-2 border-[var(--accent-ink)]/60 bg-[var(--surface-panel)] px-3.5 py-2.5 text-xs leading-relaxed text-[var(--ink-primary)]">
            <span className="font-mono uppercase tracking-[0.14em] text-[var(--accent-ink)]">
              Outcome:{" "}
            </span>
            {project.impact}
          </p>
        </div>

        <ul
          aria-label={`Stack for ${project.title}`}
          className="mt-5 flex flex-wrap gap-2"
        >
          {project.stack.map((tech) => (
            <li
              key={tech}
              className="border border-[var(--surface-hairline)] bg-[var(--surface-panel)] px-2.5 py-1 font-mono text-[11px] text-[var(--ink-secondary)]"
            >
              {tech}
            </li>
          ))}
        </ul>
      </div>

      <footer className="mt-6 border-t border-[var(--surface-hairline)] pt-4">
        {renderStatusActions(project, openBrief)}
      </footer>

      <dialog
        ref={dialogRef}
        aria-labelledby={dialogTitleId}
        onClick={handleBackdropClick}
        className="brief-dialog"
      >
        <div className="flex items-start justify-between gap-4 border-b border-[var(--surface-hairline)] px-6 py-5">
          <div>
            <div className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--accent-ink)]">
              {project.code} {"//"} {project.domain}
            </div>
            <h2
              id={dialogTitleId}
              className="mt-1 font-display text-2xl font-bold tracking-[-0.02em] text-[var(--ink-primary)]"
            >
              {project.title}
            </h2>
            <p className="mt-1 font-mono text-xs text-[var(--ink-muted)]">
              {project.organization} · {project.year}
            </p>
          </div>

          <button
            type="button"
            onClick={closeBrief}
            aria-label={`Close ${project.title} brief`}
            className="inline-flex min-h-11 min-w-11 items-center justify-center border border-[var(--surface-hairline)] bg-[var(--surface-chip)] text-[var(--ink-primary)] transition-colors hover:border-[var(--accent-ink)] hover:text-[var(--accent-ink)]"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="space-y-5 px-6 py-6">
          <p className="text-sm leading-relaxed text-[var(--ink-secondary)]">
            {project.summary}
          </p>

          <div>
            <h3 className="font-mono text-xs uppercase tracking-[0.16em] text-[var(--accent-ink)]">
              Key Details
            </h3>
            <ul className="mt-3 space-y-2.5 text-sm leading-relaxed text-[var(--ink-secondary)]">
              {project.architectureHighlights.map((highlight, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span
                    aria-hidden="true"
                    className="mt-2 h-1.5 w-1.5 shrink-0 bg-[var(--accent-volt)]"
                  />
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="border-l-2 border-[var(--accent-ink)] bg-[var(--surface-panel)] px-4 py-3 text-sm text-[var(--ink-primary)]">
            <span className="font-mono text-xs uppercase tracking-[0.14em] text-[var(--accent-ink)]">
              Outcome:{" "}
            </span>
            {project.impact}
          </div>

          <div className="border-t border-[var(--surface-hairline)] pt-4">
            <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--ink-muted)]">
              {project.status === "live"
                ? "Verified External Links"
                : "Future Portfolio Link Slot"}
            </div>
            {project.status === "live" ? (
              <div className="mt-3 flex flex-wrap gap-3">
                {isExternalHttpUrl(project.liveUrl) ? (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center gap-2 bg-[var(--accent-solid)] px-4 text-xs font-bold uppercase tracking-[0.12em] text-[var(--accent-on-solid)] hover:bg-[var(--accent-solid-hover)]"
                  >
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Open Live Deployment</span>
                  </a>
                ) : null}
                {project.repoUrl && isExternalHttpUrl(project.repoUrl) ? (
                  <a
                    href={project.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center gap-2 border border-[var(--surface-hairline)] px-4 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--ink-primary)] hover:border-[var(--accent-ink)] hover:text-[var(--accent-ink)]"
                  >
                    <Code2 className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Inspect Repository</span>
                  </a>
                ) : null}
              </div>
            ) : (
              <p className="mt-2 text-xs leading-relaxed text-[var(--ink-muted)]">
                Status:{" "}
                <strong className="text-[var(--ink-primary)]">
                  {project.targetRelease}
                </strong>
                . Live deployment and public repository links will attach
                directly to this dossier once published.
              </p>
            )}
          </div>
        </div>
      </dialog>
    </article>
  );
}
