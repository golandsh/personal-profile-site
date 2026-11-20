"use client";

import { ArrowUpRight, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactElement, useEffect, useId, useRef, useState } from "react";

interface NavItem {
  readonly label: string;
  readonly href: string;
  readonly matchPath?: string;
}

const NAV_ITEMS: readonly NavItem[] = [
  { label: "About", href: "/#about" },
  { label: "Career", href: "/#career" },
  { label: "Stack", href: "/#capabilities" },
  { label: "Portfolio", href: "/portfolio", matchPath: "/portfolio" },
  { label: "Contact", href: "/#contact" },
];

export interface SiteHeaderProps {
  readonly monogram: string;
  readonly name: string;
  readonly linkedinUrl: string;
}

export function SiteHeader({
  monogram,
  name,
  linkedinUrl,
}: SiteHeaderProps): ReactElement {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const mobileMenuId = useId();
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!mobileMenuOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileMenuOpen]);

  const isCurrentRoute = (item: NavItem): boolean => {
    if (!item.matchPath) {
      return false;
    }
    return pathname === item.matchPath;
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-[#07090d]/85 backdrop-blur-md">
      <div className="mx-auto flex h-18 max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            aria-current={pathname === "/" ? "page" : undefined}
            className="group inline-flex min-h-11 items-center gap-2.5 text-slate-50 transition-colors hover:text-cyan-300"
          >
            <span className="inline-flex h-9 w-11 items-center justify-center border border-cyan-400/50 bg-cyan-400/10 font-mono text-sm font-semibold tracking-wider text-cyan-300 transition-colors group-hover:border-cyan-300 group-hover:bg-cyan-400/20">
              {monogram}
            </span>
            <span className="font-display text-base font-semibold tracking-[-0.02em]">
              {name}
            </span>
          </Link>

          <span className="hidden items-center gap-2 border-l border-slate-800 pl-4 font-mono text-[11px] tracking-[0.16em] uppercase text-slate-400 lg:inline-flex">
            <span className="status-dot" aria-hidden="true" />
            TLV · 20 YRS EXP
          </span>
        </div>

        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          <ul className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const active = isCurrentRoute(item);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`inline-flex min-h-11 items-center px-3.5 text-sm font-medium transition-colors ${
                      active
                        ? "border-b-2 border-cyan-400 text-cyan-300"
                        : "text-slate-300 hover:text-white"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <a
            href={linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-3 inline-flex min-h-11 items-center gap-1.5 border border-cyan-400/50 bg-cyan-400/10 px-4 text-xs font-semibold tracking-[0.12em] uppercase text-cyan-200 transition-colors hover:border-cyan-300 hover:bg-cyan-400 hover:text-slate-950"
          >
            LinkedIn
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        </nav>

        <button
          ref={menuButtonRef}
          type="button"
          className="inline-flex min-h-11 min-w-11 items-center justify-center border border-slate-700/80 bg-slate-900/80 px-3 text-slate-200 transition-colors hover:border-cyan-400/60 hover:text-cyan-300 md:hidden"
          aria-expanded={mobileMenuOpen}
          aria-controls={mobileMenuId}
          onClick={() => setMobileMenuOpen((prev) => !prev)}
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Menu className="h-5 w-5" aria-hidden="true" />
          )}
          <span className="ml-2 font-mono text-xs uppercase tracking-wider">
            {mobileMenuOpen ? "Close" : "Menu"}
          </span>
        </button>
      </div>

      {mobileMenuOpen ? (
        <nav
          id={mobileMenuId}
          aria-label="Mobile"
          className="border-t border-slate-800 bg-[#090d14] px-5 py-4 md:hidden"
        >
          <ul className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => {
              const active = isCurrentRoute(item);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex min-h-11 items-center justify-between border-l-2 px-3 py-2 text-sm font-medium transition-colors ${
                      active
                        ? "border-cyan-400 bg-cyan-400/10 text-cyan-200"
                        : "border-transparent text-slate-200 hover:border-slate-600 hover:bg-slate-900/70"
                    }`}
                  >
                    <span>{item.label}</span>
                    {active ? (
                      <span className="font-mono text-[10px] uppercase tracking-widest text-cyan-300">
                        Active
                      </span>
                    ) : null}
                  </Link>
                </li>
              );
            })}
            <li className="pt-2">
              <a
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="flex min-h-11 items-center justify-center gap-2 border border-cyan-400/60 bg-cyan-400/15 px-4 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-200"
              >
                Connect on LinkedIn
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </li>
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
