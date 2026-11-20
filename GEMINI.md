# Project Rules & Engineering Standards

## 1. Tech Stack

- **Framework**: Next.js (App Router) with React.
- **Language**: TypeScript only for all application, config (`next.config.ts`), and test code. Do not write plain `.js`/`.jsx` source files.
- **Compiler Strictness**: `tsconfig.json` must enable `"strict": true`, `"noImplicitAny": true`, `"noUncheckedIndexedAccess": true`, and `"noFallthroughCasesInSwitch": true`.

## 2. Strict Type Safety (Zero `any` Policy)

- **Never use `any`** — explicit (`: any`, `<any>`, `as any`) or implicit. Enforce `@typescript-eslint/no-explicit-any: "error"` in ESLint.
- **Never silence the type checker** with `@ts-ignore` or `@ts-nocheck`. If `@ts-expect-error` is ever unavoidable (e.g., broken third-party types), document the exact reason on the same line.
- **Validate at every boundary**: Type untrusted or external data (API payloads, URL params, `JSON.parse`, environment variables, third-party responses) as `unknown` and narrow with type guards or a runtime schema validator (e.g., Zod).
- **Avoid unsafe type assertions**: Do not cast away errors with `as SomeType` unless narrowed first. Prefer `satisfies`, discriminated unions, generics, and `readonly` types.
- **Explicit public contracts**: Declare explicit prop types, return types on exported functions/Route Handlers/Server Actions, and typed error results.
- **Strongly typed tests**: Test code and mocks follow the exact same no-`any` rule. Use typed factories and `Partial<T>` builders instead of `as any`.

## 3. Workspace Skills & Subagent Verification

This repository includes three specialized skills under `.agents/skills/`:

| Skill | Path | Responsibility |
| :--- | :--- | :--- |
| `unit-testing` | `.agents/skills/unit-testing/SKILL.md` | Unit/component test design, edge cases, typed mocks, and test execution |
| `security-audit` | `.agents/skills/security-audit/SKILL.md` | Secrets, RSC/Server Action boundaries, validation, XSS/injection, headers |
| `code-review` | `.agents/skills/code-review/SKILL.md` | Strict typing audit, Next.js/React patterns, readability, accessibility |

### Execution Mode: Direct vs. Single-Skill Subagents

Before finalizing changes, decide how to apply these skills:

1. **Direct execution** — Read and execute the relevant skill(s) directly when the change is small, localized (e.g., 1–2 files), and low-risk.
2. **Single-skill subagent verification (Preferred for non-trivial work)** — For new features, multi-file changes, auth/data/API logic, or final pre-delivery checks, spawn **dedicated subagents where each subagent owns exactly one skill**:
   - **Unit Testing Subagent** (`unit-testing` only): Reviews/writes unit tests for the changed files, runs the test suite, and reports gaps or failures.
   - **Security Audit Subagent** (`security-audit` only): Audits the changed files and config strictly for security issues and reports findings by severity.
   - **Code Review Subagent** (`code-review` only): Reviews the diff strictly for type safety, architecture, Next.js best practices, and maintainability.
   - Run independent verification subagents in parallel when possible. Provide each subagent with the changed file paths, its single assigned skill path, and a clear verdict format.
   - Consolidate all subagent reports, fix every blocking issue, and re-verify after fixes.

## 4. Never Assume Completeness

Never claim a task is complete based on reading code or assuming a build will pass. Every change must be **proven to work, tested, and secured** before reporting done.

### Mandatory Verification Gate

Run and verify all applicable checks before completing any code task:

1. **Type-check**: Run `tsc --noEmit` — must exit `0` with zero errors.
2. **Lint**: Run the project linter — must exit `0` with zero errors (including zero `any` violations).
3. **Unit & Component Tests**: Run the test suite — all existing and newly added tests must pass.
4. **Build**: Run `next build` — production build must succeed without errors.
5. **Security Check**: Apply the `security-audit` skill (directly or via subagent) — zero unresolved Critical/High findings.
6. **Code Review**: Apply the `code-review` skill (directly or via subagent) — zero unresolved blockers.
7. **Runtime Verification**: For UI, routing, or API changes, verify actual rendered/runtime behavior (no console errors, hydration mismatches, or broken routes).

If any check cannot be executed (e.g., missing tool or uninitialized scaffolding), explicitly state what was **not** verified and why. Never imply an unrun check passed.
