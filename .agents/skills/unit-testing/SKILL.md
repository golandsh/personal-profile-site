---
name: unit-testing
description: >-
  Guides writing, strengthening, and verifying strongly-typed unit and component
  tests for Next.js + TypeScript code. Use when adding features, fixing bugs,
  improving test coverage, or auditing test quality before completion. Supports
  direct execution or spawning a dedicated single-skill subagent.
---

# Unit Testing Skill (Next.js + TypeScript)

## Execution Mode: Direct vs. Single-Skill Subagent

Decide how to run this skill based on task scope:

- **Run directly** if the change is small (1–2 files), you are actively TDD-ing a single unit, or you are already running inside a delegated single-skill subagent.
- **Delegate to a dedicated single-skill subagent** when verifying a feature, multi-file change, or bug fix so an independent agent challenges your implementation with fresh edge cases:
  - Spawn one subagent whose **sole responsibility** is this skill (`.agents/skills/unit-testing/SKILL.md`).
  - Pass it: the list of modified/added files, the test runner command, and explicit instructions to (1) identify missing test cases, (2) add or recommend strongly-typed unit tests, (3) execute the test suite, and (4) return a pass/fail verdict with command output.
  - Do not combine `security-audit` or `code-review` into the same subagent.
  - Never spawn nested subagents if you are already operating as the `unit-testing` subagent.

## Recommended Test Stack

- **Runner & Assertions**: Vitest (preferred for speed & TS support) or Jest.
- **Component Testing**: `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`.
- **Network Mocking**: MSW (Mock Service Worker) or typed boundary mocks.

## Strong Typing Rules for Tests

- **Zero `any` in tests**: Never use `as any`, `: any`, or `@ts-ignore` to shortcut mock setup.
- **Typed Factories**: Build reusable `createMock<Entity>(overrides?: Partial<Entity>): Entity` helpers so tests remain resilient to schema changes.
- **Typed Mocks**: Use `vi.mocked(fn)` / `jest.mocked(fn)` and `satisfies` for fixture objects.

## High-Value Test Suggestions to Implement

Prioritize tests that catch real regressions across every layer of a Next.js app:

### 1. Pure Logic, Utilities & Schema Validators
- Test business logic, formatters, date/string utilities, mappers, and Zod schemas exhaustively.
- Assert both valid inputs (accepted and normalized correctly) and malformed inputs (rejected with expected error messages/codes).

### 2. Next.js Route Handlers (`app/api/**/route.ts`) & Server Actions
- Test with real `Request` / `NextRequest` objects and assert HTTP status codes, JSON response shapes, and headers.
- Cover:
  - Happy path with valid typed payload.
  - Validation failures (`400`) for missing fields, wrong types, oversized strings, and malformed JSON.
  - Auth/authorization failures (`401` unauthenticated, `403` forbidden) where applicable.
  - Downstream dependency failure (`500`/`502`) ensuring safe error payloads without leaking internals.

### 3. React Components (Client & Server)
- Query by accessible semantics (`getByRole`, `getByLabelText`, `getByText`), not test IDs or CSS classes.
- Drive interactions with `userEvent.setup()` (typing, clicking, keyboard navigation, form submission).
- Test all UI states: default/populated, empty state, loading state, error state, and disabled/submitting states.
- Verify conditional rendering and callback payloads.

### 4. Custom Hooks & State Transitions
- Use `renderHook` + `act` for non-trivial hooks.
- Verify cleanup on unmount (event listeners, timers, `AbortController` cancellations).

## Edge-Case Checklist

For every non-trivial function or component, explicitly check and test relevant cases:

- **Empty & Boundary Values**: `""`, whitespace-only `"   "`, `[]`, `{}`, `0`, `-1`, `NaN`, max-length strings, `null` / `undefined`.
- **Async & Concurrency**: rejected promises, network timeouts, out-of-order responses, double-clicks / duplicate submissions.
- **Determinism**: use fake timers (`vi.useFakeTimers()`) or injected clocks/randomness — never depend on live wall-clock time or local timezone.
- **Security-Relevant Cases**: untrusted input rejected by validators, XSS payloads rendered as escaped text, unauthorized actions blocked.
- **Regression Tests**: Every bug fix must include a test that fails before the fix and passes after.

## Test Structure & Anti-Patterns

- Follow **AAA (Arrange, Act, Assert)** with a clear visual separation between phases.
- Name tests by observable behavior: `it("disables submit button while contact form is submitting")`.
- **Avoid**:
  - Testing private implementation details or internal hook state directly.
  - Over-mocking internal modules (mock only external boundaries: network, database, clock, `next/navigation`).
  - Large brittle snapshots used in place of specific behavioral assertions.
  - Shared mutable state across tests (always reset mocks/state in `beforeEach`/`afterEach`).

## Verification Procedure (Mandatory)

1. Run the test suite command (e.g., `pnpm test` / `npm test` / `npx vitest run`).
2. Run `tsc --noEmit` to confirm test files themselves pass strict TypeScript checks.
3. Never report tests as passing unless you directly observed exit code `0` after the latest edit.

## Output Format (Especially for Subagent Reports)

Return a concise report containing:
- **Command Run & Result**: exact command, exit code, passed/failed/skipped counts.
- **Tests Added / Updated**: file paths and behaviors covered.
- **Remaining Gaps / Suggestions**: prioritized list of untested edge cases or risk areas.
- **Verdict**: `PASS` or `FAIL` (with blocking failures listed first).
