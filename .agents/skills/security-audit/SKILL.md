---
name: security-audit
description: >-
  Audits Next.js + TypeScript code and configuration for security
  vulnerabilities, secret exposure, unsafe RSC/Server Action boundaries,
  injection/XSS risks, and missing security headers. Use before completing
  features, API routes, forms, auth logic, or config changes. Supports direct
  execution or spawning a dedicated single-skill subagent.
---

# Security Audit Skill (Next.js + TypeScript)

## Execution Mode: Direct vs. Single-Skill Subagent

Decide how to run this skill based on risk and scope:

- **Run directly** for trivial, non-security-sensitive edits (e.g., static copy or minor CSS tweaks) or when already running inside a delegated single-skill subagent.
- **Delegate to a dedicated single-skill subagent** whenever changes touch API routes, Server Actions, forms, authentication, environment variables, headers/middleware, external links/fetches, dynamic HTML/Markdown rendering, or dependencies:
  - Spawn one subagent whose **sole responsibility** is this skill (`.agents/skills/security-audit/SKILL.md`).
  - Pass it: the list of changed files (plus `next.config.ts`, `.gitignore`, and `package.json` if relevant) and instruct it to inspect every item in the checklist below and return severity-ranked findings with exact `file:line` references.
  - Do not combine `unit-testing` or `code-review` into the same subagent.
  - Never spawn nested subagents if you are already operating as the `security-audit` subagent.

## Security Audit Checklist

### 1. Secrets & Environment Variables
- [ ] No hardcoded API keys, tokens, passwords, private keys, or webhook secrets anywhere in source or tests.
- [ ] `.env`, `.env.local`, and `.env.*.local` are excluded in `.gitignore`.
- [ ] Sensitive server secrets do **not** use the `NEXT_PUBLIC_` prefix.
- [ ] Environment variables are parsed/validated at startup with a typed schema (never unvalidated `process.env.X!`).
- [ ] Server secrets are never passed as props from Server Components to Client Components (they serialize into the HTML payload).

### 2. Next.js Server / Client Boundary
- [ ] Server-only modules (DB clients, secret SDKs, internal helpers) import `"server-only"` so they fail fast if accidentally imported into a Client Component.
- [ ] Every **Route Handler** (`app/api/**/route.ts`) and **Server Action** (`"use server"`) treats incoming inputs as untrusted and validates them at runtime with a schema (TypeScript types are erased at runtime).
- [ ] Authentication and authorization (including resource ownership checks) are enforced inside every protected Route Handler and Server Action — never rely solely on UI hiding or middleware alone.
- [ ] Data passed from Server Components to Client Components is mapped to minimal public DTOs (no internal IDs, emails, hashes, or private metadata leaked).

### 3. XSS, Injection & Unsafe Rendering
- [ ] No `dangerouslySetInnerHTML`, `innerHTML`, `eval`, `new Function`, or `document.write`. If rendering rich text/Markdown, enforce strict allowlist sanitization (e.g., `rehype-sanitize` / DOMPurify) and test with XSS payloads.
- [ ] Dynamic `href` / `src` attributes sourced from external or user input reject `javascript:`, `vbscript:`, and unsafe `data:` URLs.
- [ ] External links with `target="_blank"` include `rel="noopener noreferrer"`.
- [ ] Database queries use parameterized statements / ORM bindings — zero string concatenation with user input.
- [ ] No shell execution (`child_process.exec`) with interpolated user input.

### 4. SSRF, Open Redirects & Path Traversal
- [ ] Outbound server-side `fetch()` calls never accept arbitrary user-controlled URLs without strict protocol (`https:`), host allowlist, and private-IP blocking.
- [ ] Redirect targets (`redirect()`, `NextResponse.redirect()`) validate against relative internal paths or an explicit domain allowlist.
- [ ] Filesystem operations normalize paths (`path.resolve`) and assert containment within an intended base directory.

### 5. HTTP Headers, Cookies & Abuse Prevention
- [ ] `next.config.ts` sets baseline security headers:
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `X-Frame-Options: DENY` (or CSP `frame-ancestors 'none'`)
  - `Permissions-Policy` restricting unused browser APIs
  - `Content-Security-Policy` where feasible without breaking app functionality
- [ ] Cookies carrying sessions/tokens set `HttpOnly`, `Secure`, and `SameSite=Lax` (or `Strict`).
- [ ] CORS does not combine `Access-Control-Allow-Origin: *` with `Access-Control-Allow-Credentials: true`.
- [ ] Public mutating endpoints (e.g., contact forms) enforce input length limits, content-type checks, and rate limiting / abuse protection.

### 6. Error Handling & Dependencies
- [ ] API/action errors return generic user-safe messages and never leak stack traces, file paths, or raw database/SDK errors to clients.
- [ ] When `package.json` or lockfiles change, run dependency vulnerability audit (`pnpm audit` / `npm audit`) and flag High/Critical advisories.

## Severity Classification & Gate

Classify every finding strictly:
- **Critical / High (Blocking)**: Exploitable vulnerabilities, secret leaks, missing auth/validation on mutating endpoints, XSS/injection, unsafe `NEXT_PUBLIC_` secrets. **Must be fixed before completion.**
- **Medium**: Defense-in-depth gaps (missing security headers, overly broad CORS, missing rate limit on public form). Fix or document explicit acceptance.
- **Low**: Minor hardening improvements.

## Output Format (Especially for Subagent Reports)

Return a concise report containing:
- **Scope Audited**: exact files and configs inspected.
- **Findings** (grouped by severity): `[Severity] file:line — issue description — concrete fix`.
- **Checks Run**: e.g., secret grep, dependency audit command + output (if applicable).
- **Verdict**: `PASS` (zero Critical/High) or `BLOCKED` (unresolved Critical/High findings).
