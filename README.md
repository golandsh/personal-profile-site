# Shlomi Goland — Personal Profile Site

Enterprise-meets-edgy personal profile website built with **Next.js (App Router)**, **strict TypeScript (zero `any`)**, **Tailwind CSS**, and **Vitest**.

## Commands

```sh
pnpm install       # Install dependencies
pnpm dev           # Start local dev server on http://localhost:3000
pnpm build         # Production build
pnpm start         # Serve production build on http://localhost:3000
pnpm typecheck     # tsc --noEmit
pnpm lint          # ESLint (zero-any enforced)
pnpm test          # Vitest unit & component suite
```

## Structure

- [`src/data/profile.ts`](./src/data/profile.ts) — Zod-validated profile, career timeline, skills, and education data.
- [`src/data/portfolio.ts`](./src/data/portfolio.ts) — Future-ready portfolio registry; switch an entry's `status` to `"live"` and add `liveUrl` / `repoUrl` to publish links.
- [`src/app/page.tsx`](./src/app/page.tsx) — Main profile (`About`, `Career`, `Stack`, `Portfolio`, `Contact`).
- [`src/app/portfolio/page.tsx`](./src/app/portfolio/page.tsx) — Dedicated filterable portfolio archive.
- [`src/app/api/digital-twin/route.ts`](./src/app/api/digital-twin/route.ts) — Server-only OpenRouter chat endpoint (`nvidia/nemotron-3-ultra-550b-a55b:free`) powering the floating Digital Twin concierge.
- [`GEMINI.md`](./GEMINI.md) & [`.agents/skills/`](./.agents/skills/) — Engineering rules and single-skill verification workflows (`unit-testing`, `security-audit`, `code-review`).

## Environment

Local secrets live in `.env` (gitignored). Set `OPENROUTER_API_KEY` in `.env` for the Digital Twin AI chat. Never expose private secrets via `NEXT_PUBLIC_`.
