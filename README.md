# DUG — Decentralized Underwriting Group

A consulting marketplace for independent underwriters. Think GitHub × Reddit × Uber, built for risk experts.

**Status:** MVP sandbox is functional — seeded with 10 demo profiles and 11 jobs, end-to-end claim → submit → review flow works.

## Stack

- **Framework:** Next.js 15 (App Router, TypeScript)
- **Styling:** Tailwind CSS v4
- **Data + Auth:** Supabase (Postgres, Auth, RLS)
- **Email:** Resend (wiring pending)
- **Hosting:** Netlify (deploy pending)
- **DNS:** Cloudflare (later)
- **Source:** GitHub — `TheJimmyJam/DUG`

## Local development

```bash
npm install
npm run dev
```

The app runs at <http://localhost:3000>. `.env.local` is already populated with
the dev Supabase project + service-role keys.

## What's wired right now

- **Landing** (`/`) — value prop + how-it-works for the six archetypes
- **Job board** (`/jobs`) — browse all open jobs, filter by specialty
- **Job detail** (`/jobs/[id]`) — full description, claim button, role-aware
  CTAs (claim / submit / review depending on whether you're the poster,
  claimer, or someone else)
- **Submit analysis** (`/jobs/[id]/submit`) — structured recommendation form
  with rationale, suggested premium, red flags, confidence
- **Review submission** (`/jobs/[id]/review`) — poster reviews and rates
  the underwriter; rating triggers recompute on profile
- **Public profile** (`/u/[handle]`) — Reddit-style portfolio: bio, specialty
  tags, rating, review history, completed work
- **Underwriter directory** (`/underwriters`) — sortable, filterable list
  of all underwriters in the network
- **Post a job** (`/post-job`) — auth-gated form, full taxonomy + budget types
- **Dashboard** (`/dashboard`) — overview, my claimed jobs, jobs I posted,
  edit profile (handle, bio, location, specialty tags)
- **Auth** — email + password signup with confirmation, login, logout,
  middleware-driven session refresh

## Database

Six tables: `profiles`, `profile_specialties`, `jobs`, `submissions`,
`reviews`, `notifications`. RLS locks every table down by default and opens
exactly the surfaces each role needs. Triggers auto-create a profile when an
auth user signs up, recompute the underwriter's rating on every review,
and bump `completed_job_count` when a job moves to completed.

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Local dev server |
| `npm run build` | Production build |
| `npm run typecheck` | TS-only check (no emit) |
| `npm run lint` | Next ESLint |
| `npm run db:migrate` | Apply `supabase/migrations/*.sql` via the Management API |
| `npm run db:types` | Regenerate `src/lib/database.types.ts` from the live schema |
| `npm run db:seed` | (Re)populate demo users + jobs in the sandbox |

`db:migrate` and `db:types` use the `SUPABASE_PAT` from `.env.local`. Both
are idempotent in the sense that re-running won't duplicate data — but
migrations themselves aren't tracked, so for a hard reset drop the schema
in the dashboard first.

## Demo accounts

After running `npm run db:seed`, you can log in as any of these to see the
authenticated experience:

| Email | Role |
|---|---|
| `sarah.chen+demo@dug.example` | underwriter (cyber, professional liability) |
| `marcusrivera+demo@dug.example` | underwriter (CAT property, retired) |
| `ben+demo@dug.example` | both (poster + underwriter, admin) |
| `westpoint_mga+demo@dug.example` | poster only (specialty MGA) |

Password for all demo accounts: `DemoUW2026!`

## Architecture decisions

- **Advisory only.** The platform never lets a user bind coverage. Members
  provide analysis and recommendations; the poster makes the binding decision
  themselves. This is the regulatory red line — don't move it without legal
  review.
- **Demo mode first.** Anonymous visitors at a conference can browse the
  full job board and underwriter directory without signing up. Real auth is
  parallel, not gated.
- **Reputation is the moat.** Every completed job feeds rating, visible
  publicly on the underwriter's profile.
- **Multi-tenant data isolation** lives in the Supabase schema (RLS) rather
  than at the app layer — required for any future carrier pilot.
- **Black-box ingest** for future carrier integrations: carriers export data
  via standard bordereaux (CSV/XML) like they already do for reinsurers; we
  never need direct API integration with their core systems.

## Directory layout

```
src/
  app/                  Next.js App Router routes
    auth/               Server actions + email-confirmation callback
    dashboard/          Auth-gated user area (profile, my jobs, posted)
    jobs/               Public job board + detail + claim + submit + review
    u/[handle]/         Public underwriter profile
    post-job/           Auth-gated job posting form
    legal/              Terms, privacy
  components/
    ui/                 Primitive components (button, card, badge, input)
    site-header.tsx     Top nav
    site-footer.tsx     Footer
    job-card.tsx        Reusable job summary card
  lib/
    supabase/           Browser, server, service-role, middleware clients
    specialties.ts      Specialty taxonomy (also used in matching/filters)
    database.types.ts   Auto-generated from the live schema
    utils.ts            Small helpers
supabase/
  migrations/           SQL migrations applied via Management API
  config.toml           Supabase CLI config
scripts/
  db-migrate-api.mjs    Push migrations via Management API (no DB access required)
  db-types.mjs          Pull TS types from the live schema
  seed.mjs              Idempotent demo data
```

## What's next

- Wire Resend for email (welcome, claim confirmed, submission received,
  review received)
- Deploy to Netlify (auto-deploy on push to `main`)
- Cloudflare DNS for `trydug.com` or chosen domain
- 2FA enrollment UX (Supabase Auth supports it; UI surface still pending)
- Notifications dropdown in header (DB table exists, UI pending)
