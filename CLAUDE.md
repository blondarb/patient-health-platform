# Patient Health Platform

Patient health prototype with AI-powered clinical insights via AWS Bedrock. Features demo mode with 3 patient scenarios and static JSON data.

> **Status: Legacy / Reference only.** Superseded by `synapse-teleencounter`
> for the active prototype. Keep here as a static reference for the
> Bedrock-integration pattern and demo patient schemas.

## Tech Stack

- **Frontend**: Web (static deployment)
- **AI**: AWS Bedrock
- **Data**: Static JSON (migrated from database for simple deployment)
- **Local dev:** `prisma/` + `dev.db` remnants exist but are NOT used at runtime
- **Project scaffold:** Next.js (see `next.config.ts`, `components.json` for shadcn)

## Commands
```bash
npm install
npm run dev         # http://localhost:3000 — preview demo
npm run build       # static export
```

## Demo Patients (static JSON)
Located in `src/` (exact path varies — grep for `demo-patients`). Three
prebuilt scenarios for conference demos. DO NOT add real PHI — this
data ships with the bundle.

## Known Gotchas
- `prisma/` + `dev.db` are vestigial from the pre-static-JSON era. Do not
  re-introduce Prisma/Supabase — the migration was deliberate.
- Bedrock calls hit us-east-2 with profile `sevaro-sandbox`.
- No auth. No PHI. Demo only.

## Body of Work

**Status**: Legacy

### Recent
- **CLAUDE.md improvements (PR #2, May 1)** — Applied claude-md-improver bottom-5 recommendations; documentation structure, known issues, and workflow guidance updated.
- Migrated AI client from OpenAI to AWS Bedrock
- Replaced database with static JSON for simpler deployment
- Added demo mode with 3 patient scenarios on welcome page

### In Progress
- None

### Planned
- No active development planned; serves as a prototype/reference

### Known Issues
- Prisma scaffolding still present in `prisma/` — remove if another session ever unarchives this.

## Documentation Files

Update these when committing changes (per global Commit Workflow rules):

- `CLAUDE.md` — update if architecture, config, or status changed
- `docs/HANDOFF_YYYY-MM-DD.md` — create/update with session summary and next steps
