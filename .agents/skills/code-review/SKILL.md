---
name: code-review
description: >-
  Performs a thorough Next.js + TypeScript code review covering strict type
  safety (zero any), App Router/React correctness, clean architecture,
  accessibility, and verification completeness. Use before finalizing changes.
  Supports direct execution or spawning a dedicated single-skill subagent.
---

# Code Review Skill (Next.js + TypeScript)

## Execution Mode: Direct vs. Single-Skill Subagent

Decide how to run this skill based on change size and complexity:

- **Run directly** for small, localized edits (1–2 files) or when already running inside a delegated single-skill subagent.
- **Delegate to a dedicated single-skill subagent** for feature implementations, refactors, or multi-file changes so an independent reviewer inspects the diff without author bias:
  - Spawn one subagent whose **sole responsibility** is this skill (`.agents/skills/code-review/SKILL.md`).
  - Pass it: the list of modified/added files (or `git diff` scope) and instruct it to audit every section below and return a structured `APPROVE` / `CHANGES_REQUESTED` review.
  - Do not combine `unit-testing` or `security-audit` into the same subagent.
  - Never spawn nested subagents if you are already operating as the `code-review` subagent.

## Code Review Checklist

### 1. Strict TypeScript Enforcement (Zero `any`)
- [ ] Zero occurrences of `: any`, `<any>`, `as any`, `any[]`, `Record<string, any>`, or implicit `any` in source or test files.
- [ ] Zero `@ts-ignore` or `@ts-nocheck` directives; any `@ts-expect-error` has a clear justification.
- [ ] No unsafe `as SomeType` casts bypassing validation; external inputs use `unknown` + narrowing or runtime schema validation.
- [ ] No unnecessary non-null assertions (`!`) where proper narrowing or optional handling is safer.
- [ ] Exported functions, Route Handlers, Server Actions, and component props have clear, narrow types (prefer discriminated unions, `readonly`, `satisfies`, and exhaustive `switch` checks).

### 2. Next.js App Router & React Correctness
- [ ] Components default to **Server Components**; `"use client"` is pushed down to the smallest leaf component that actually needs hooks, state, or browser APIs.
- [ ] No SSR/hydration mismatches (e.g., `window`, `localStorage`, `Date.now()`, `Math.random()` called directly during render without guarding/effect).
- [ ] Uses `next/link` for internal navigation and `next/image` (with proper dimensions/`alt`) for images where appropriate.
- [ ] Metadata (`metadata` / `generateMetadata`), `loading.tsx`, `error.tsx`, and `not-found.tsx` are used cleanly where relevant.
- [ ] Hooks obey rules of hooks: complete dependency arrays, no redundant `useEffect` for derived state, proper cleanup on unmount.
- [ ] List items use stable unique `key` props (never array index for dynamic/reorderable lists).

### 3. Clean Code & Maintainability
- [ ] Functions and components have a single, clear responsibility; avoid deep nesting via early returns / guard clauses.
- [ ] Clear, domain-accurate naming; no magic numbers/strings without named constants.
- [ ] Errors are handled explicitly — no empty `catch {}` blocks or swallowed promises.
- [ ] No dead code, commented-out blocks, unused imports/variables, or leftover debug `console.log` statements.
- [ ] Changes are tightly scoped to the user's request without unrelated churn.

### 4. Accessibility & Semantic HTML
- [ ] Semantic landmarks and elements (`<main>`, `<nav>`, `<header>`, `<footer>`, `<button>` for actions, `<a>` for navigation, proper heading order `h1`–`h6`).
- [ ] Interactive controls are keyboard-accessible with visible focus states and accessible names (`aria-label` or visible label).
- [ ] Meaningful `alt` text on informative images (`alt=""` for decorative images).

### 5. Verification Completeness Check
- [ ] Confirm `tsc --noEmit` passed with 0 errors.
- [ ] Confirm linter passed with 0 errors.
- [ ] Confirm production build (`next build`) succeeded.
- [ ] Confirm unit/component tests were run and passed (never assumed).

## Severity Levels

- **Blocker**: Type-safety violation (`any`, unsafe cast), bug, hydration error, broken contract, unhandled error, missing verification. Must fix before completion.
- **Suggestion**: Meaningful improvement to clarity, decomposition, performance, or accessibility.
- **Nit**: Minor style or naming polish.

## Output Format (Especially for Subagent Reports)

Return a concise review containing:
- **Files Reviewed**: exact file paths inspected.
- **Findings** (grouped by `Blocker`, `Suggestion`, `Nit`): `file:line — issue — concrete fix`.
- **Verification Status**: confirm which checks (`tsc`, lint, test, build) were verified vs. missing.
- **Verdict**: `APPROVE` (zero Blockers) or `CHANGES_REQUESTED` (list Blockers to resolve).
