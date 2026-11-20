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
              className="inline-flex min-h-11 items-center gap-1.5 bg-cyan-300 px-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-950 transition-colors hover:bg-[#b8ff3b]"
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
              className="inline-flex min-h-11 items-center gap-1.5 border border-slate-700 px-3.5 text-xs font-semibold uppercase tracking-[0.12em] text-slate-200 transition-colors hover:border-cyan-400/70 hover:text-cyan-200"
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
            className="inline-flex min-h-11 items-center gap-1.5 border border-slate-800 bg-slate-950/70 px-3.5 font-mono text-[11px] uppercase tracking-[0.12em] text-slate-300 transition-colors hover:border-cyan-400/60 hover:text-cyan-200"
          >
            <FileCode2 className="h-3.5 w-3.5 text-cyan-300" aria-hidden="true" />
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
          <span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-slate-400">
            <Clock className="h-3.5 w-3.5 text-cyan-400" aria-hidden="true" />
            {project.targetRelease}
          </span>
          <button
            type="button"
            onClick={onOpenBrief}
            className="inline-flex min-h-11 items-center gap-1.5 border border-cyan-400/40 bg-cyan-400/10 px-3.5 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-cyan-200 transition-colors hover:border-cyan-300 hover:bg-cyan-300 hover:text-slate-950"
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
        <header className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-2.5 font-mono text-xs">
            <span className="text-cyan-300">{project.code}</span>
            <span aria-hidden="true" className="text-slate-700">
              /
            </span>
            <span className="uppercase tracking-[0.12em] text-slate-400">
              {project.domain}
            </span>
          </div>

          <span
            className={`border px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] ${
              project.status === "live"
                ? "border-[#b8ff3b]/50 bg-[#b8ff3b]/15 text-[#d5ff82]"
                : "border-cyan-400/35 bg-cyan-400/10 text-cyan-200"
            }`}
          >
            {project.status === "live" ? "Live Project" : "Dossier Queued"}
          </span>
        </header>

        <div className="mt-5">
          <div className="font-mono text-xs text-slate-400">
            {project.organization} · {project.year}
          </div>
          <h3 className="mt-1.5 font-[family-name:var(--font-display)] text-xl font-bold tracking-[-0.02em] text-slate-50">
            {project.title}
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">
            {project.summary}
          </p>

          <p className="mt-4 border-l-2 border-cyan-400/60 bg-slate-950/60 px-3.5 py-2.5 text-xs leading-relaxed text-slate-200">
            <span className="font-mono uppercase tracking-[0.14em] text-cyan-300">
              Impact:{" "}
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
              className="border border-slate-800 bg-slate-950/80 px-2.5 py-1 font-mono text-[11px] text-slate-300"
            >
              {tech}
            </li>
          ))}
        </ul>
      </div>

      <footer className="mt-6 border-t border-slate-800/80 pt-4">
        {renderStatusActions(project, openBrief)}
      </footer>

      <dialog
        ref={dialogRef}
        aria-labelledby={dialogTitleId}
        onClick={handleBackdropClick}
        className="brief-dialog"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-800 px-6 py-5">
          <div>
            <div className="font-mono text-xs uppercase tracking-[0.18em] text-cyan-300">
              {project.code} {"//"} {project.domain}
            </div>
            <h2
              id={dialogTitleId}
              className="mt-1 font-[family-name:var(--font-display)] text-2xl font-bold tracking-[-0.02em] text-slate-50"
            >
              {project.title}
            </h2>
            <p className="mt-1 font-mono text-xs text-slate-400">
              {project.organization} · {project.year}
            </p>
          </div>

          <button
            type="button"
            onClick={closeBrief}
            aria-label={`Close ${project.title} brief`}
            className="inline-flex min-h-11 min-w-11 items-center justify-center border border-slate-700 bg-slate-900 text-slate-200 transition-colors hover:border-cyan-400 hover:text-cyan-300"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="space-y-5 px-6 py-6">
          <p className="text-sm leading-relaxed text-slate-200">
            {project.summary}
          </p>

          <div>
            <h3 className="font-mono text-xs uppercase tracking-[0.16em] text-cyan-300">
              Architectural Highlights
            </h3>
            <ul className="mt-3 space-y-2.5 text-sm leading-relaxed text-slate-300">
              {project.architectureHighlights.map((highlight, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span
                    aria-hidden="true"
                    className="mt-2 h-1.5 w-1.5 shrink-0 bg-[#b8ff3b]"
                  />
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="border-l-2 border-cyan-400 bg-slate-950/80 px-4 py-3 text-sm text-slate-200">
            <span className="font-mono text-xs uppercase tracking-[0.14em] text-cyan-300">
              Outcome:{" "}
            </span>
            {project.impact}
          </div>

          <div className="border-t border-slate-800 pt-4">
            <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-slate-400">
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
                    className="inline-flex min-h-11 items-center gap-2 bg-cyan-300 px-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-950 hover:bg-[#b8ff3b]"
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
                    className="inline-flex min-h-11 items-center gap-2 border border-slate-700 px-4 text-xs font-semibold uppercase tracking-[0.12em] text-slate-200 hover:border-cyan-400 hover:text-cyan-200"
                  >
                    <Code2 className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Inspect Repository</span>
                  </a>
                ) : null}
              </div>
            ) : (
              <p className="mt-2 text-xs leading-relaxed text-slate-400">
                Status: <strong className="text-slate-200">{project.targetRelease}</strong>.
                Live deployment and public repository links will attach directly
                to this dossier once published.
              </p>
            )}
          </div>
        </div>
      </dialog>
    </article>
  );
}
