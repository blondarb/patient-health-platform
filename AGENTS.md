# Patient Health Platform

- **What it is:** Clinical documentation / patient-insights prototype
  demonstrating AI-generated clinical insights over static, synthetic demo
  data (no real patient data, no database at runtime). Superseded by
  `synapse-teleencounter` as the active prototype; kept as a static
  reference for the Bedrock-integration pattern and demo data schemas.
- **Type:** code repo
- **Stack / tools:** Next.js (App Router), TypeScript, AWS Bedrock (AI
  insights), static JSON data (no live database), Prisma scaffolding
  present but unused at runtime, Tailwind CSS, shadcn/radix UI components.
- **How to run / test:** `npm install`; `npm run dev`
  (http://localhost:3000, static demo preview); `npm run build` (static
  export); `npm run lint`.
- **Key files / structure:**
  - `src/` — app source, including static synthetic demo scenarios
  - `prisma/` — vestigial scaffolding from a pre-static-JSON era (not used
    at runtime; do not reintroduce)
  - `components.json` — shadcn config
  - `next.config.ts` — Next.js config
- **Conventions:** See CLAUDE.md.
- **Current focus / handoff notes:** ARCHIVED — no active development; kept
  for reference. Last commit 2026-04-24. Per CLAUDE.md this repo is
  explicitly "Legacy / Reference only": the app runs entirely on static,
  synthetic demo scenarios (no auth, no real patient data, no live
  database) — the AI client was migrated from OpenAI to AWS Bedrock and the
  data layer was replaced with static JSON for simpler deployment. No
  further work is planned; the leftover `prisma/`/`dev.db` scaffolding
  should be removed if this repo is ever unarchived.

<!-- Read by Claude Code, Claude Cowork, and OpenAI Codex. Auto-generated 2026-07-05 (Fable run); edit freely. -->
