"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactElement, useEffect, useId, useRef, useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";

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
  { label: "Private Life", href: "/private-life", matchPath: "/private-life" },
  { label: "Contact", href: "/#contact" },
];

export interface SiteHeaderProps {
  readonly monogram: string;
  readonly name: string;
}

export function SiteHeader({
  monogram,
  name,
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
    <header className="sticky top-0 z-50 border-b border-[var(--surface-hairline)] bg-[var(--surface-header)] backdrop-blur-md">
      <div className="mx-auto flex h-18 max-w-6xl items-center justify-between gap-6 px-5 sm:px-8">
        <Link
          href="/"
          aria-current={pathname === "/" ? "page" : undefined}
          className="group inline-flex min-h-11 shrink-0 items-center gap-2.5 text-[var(--ink-primary)] transition-colors hover:text-[var(--accent-ink)]"
        >
          <span className="inline-flex h-9 w-11 items-center justify-center border border-[var(--accent-ink)]/50 bg-[var(--accent-soft)] font-mono text-sm font-semibold tracking-wider text-[var(--accent-ink)] transition-colors">
            {monogram}
          </span>
          <span className="font-display text-base font-semibold tracking-[-0.02em]">
            {name}
          </span>
        </Link>

        <div className="hidden items-center gap-3 md:flex">
          <nav aria-label="Primary">
            <ul className="flex items-center gap-1">
              {NAV_ITEMS.map((item) => {
                const active = isCurrentRoute(item);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={`inline-flex min-h-11 items-center px-3 text-sm font-medium whitespace-nowrap transition-colors ${
                        active
                          ? "border-b-2 border-[var(--accent-ink)] text-[var(--accent-ink)]"
                          : "text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <ThemeToggle />
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            ref={menuButtonRef}
            type="button"
            className="inline-flex min-h-11 min-w-11 items-center justify-center border border-[var(--surface-hairline)] bg-[var(--surface-chip)] px-3 text-[var(--ink-primary)] transition-colors hover:border-[var(--accent-ink)] hover:text-[var(--accent-ink)]"
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
      </div>

      {mobileMenuOpen ? (
        <nav
          id={mobileMenuId}
          aria-label="Mobile"
          className="border-t border-[var(--surface-hairline)] bg-[var(--surface-slate)] px-5 py-4 md:hidden"
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
                        ? "border-[var(--accent-ink)] bg-[var(--accent-soft)] text-[var(--accent-ink-strong)]"
                        : "border-transparent text-[var(--ink-secondary)] hover:border-[var(--surface-hairline)] hover:bg-[var(--surface-panel)]"
                    }`}
                  >
                    <span>{item.label}</span>
                    {active ? (
                      <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--accent-ink)]">
                        Active
                      </span>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
