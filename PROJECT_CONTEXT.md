# PROJECT_CONTEXT — DUG (Decentralized Underwriting Group)

## What it is
A consulting marketplace for independent underwriters. Think GitHub × Reddit × Uber for risk experts. Underwriters build public profiles, companies post underwriting jobs, and the platform matches, tracks, and rates the work.

## Status
MVP functional — sandbox seeded with demo data. Deploy pending. https://decentralizedunderwritinggroup.netlify.app

## Stack
| Layer | Tech |
|---|---|
| Framework | Next.js 15 (App Router, TypeScript) |
| Styling | Tailwind CSS v4 |
| Database + Auth | Supabase (PostgreSQL + Auth + RLS) |
| Email | Resend (wiring pending) |
| Hosting | Netlify |
| Source | GitHub — `TheJimmyJam/DUG` |

## Repo layout
```
DUG/
├── src/app/
│   ├── page.tsx              ← Landing
│   ├── jobs/                 ← Job board + detail + submit + review
│   ├── underwriters/         ← Directory
│   ├── u/[handle]/           ← Public profile
│   ├── post-job/             ← Auth-gated job form
│   ├── dashboard/            ← Overview, claimed jobs, posted jobs, profile, admin
│   ├── signup/ + auth/       ← Auth flows
│   ├── about/ + trust/       ← Marketing pages
│   ├── community/            ← Community page
│   ├── manifesto/            ← Manifesto page
│   ├── pricing/              ← Pricing page
│   ├── legal/                ← Privacy + Terms
│   └── dojo/                 ← Practice cases, waitlist, scoring
│       └── cases/[slug]/     ← Case detail + submit + result
├── Docs/                     ← Scaffolding brief, build session summary, business docs
└── logo-assets/              ← Full logo suite (SVG + PNG, all sizes)
```

## Credentials (see `/Projects/.credentials`)
- `DUG_SUPABASE_URL`, `DUG_SUPABASE_ANON_KEY`, `DUG_SUPABASE_SERVICE_ROLE_KEY`
- `DUG_SUPABASE_PAT` (management API)
- `DUG_NETLIFY_PAT`
- Admin logins: `ben.volkmer@gmail.com` / `wcannon83@gmail.com` (pw: `DecenUnderGroup2024!`)
- GitHub: https://github.com/TheJimmyJam/DUG
- Netlify: https://decentralizedunderwritinggroup.netlify.app

## Database (9 tables)
Marketplace: `profiles`, `profile_specialties`, `jobs`, `submissions`, `reviews`, `notifications`
Dojo: `dojo_waitlist`, `dojo_cases`, `dojo_submissions`

Triggers: auto-create profile on signup, recompute underwriter rating on review, bump `completed_job_count` on job completion. Dojo scoring runs server-side at submit (premium-band fit + key-factor coverage, 0–100). Answer-key columns gated by RLS until submission.

## Features built
- Landing page (6 user archetypes)
- Job board with filter by specialty
- Job detail with role-aware CTAs (claim / submit / review)
- Submit analysis form (rationale, premium suggestion, red flags, confidence)
- Poster review + rating system
- Public underwriter profiles (Reddit-style portfolio)
- Underwriter directory (sortable, filterable)
- Post-a-job form (full taxonomy + budget types)
- Dashboard (overview, my jobs, posted jobs, edit profile)
- Email + password auth with confirmation, middleware session refresh
- Admin panel (`/dashboard/admin`)
- 10 demo profiles + 11 seeded jobs
- **Dojo** — landing page (hero, how-it-works, sample case, comparison, mock leaderboard, contests preview, FAQ, waitlist CTA), case detail page (`/dojo/cases/[slug]`) with structured packet, submit form (rationale, premium, recommendation, red flags, confidence), server-side scoring, result page, anonymous-friendly waitlist
- 1 seeded case live: `coastal-habitational-renewal` (DOJO-2026-001)

## Locked Decisions (2026-05-12, client-confirmed)

**Trust & Liability**
DUG is an attestation platform, not a decision-maker. We verify identity and credentials ("we've seen the credential") — we do not vouch for outcomes. Liability cannot extend to DUG because we do not bind, advise, or make underwriting decisions. Advisory output is complementary and non-definitive, like Verisk data. Users (underwriters, brokers, procurers) bear full responsibility for how they use it. This must be reflected in T&Cs and badge wording.

**Reputation & Accuracy**
Drop "accuracy" from all public reputation copy. Replace with the Reputation Index. Dojo scoring (model-based) stays. Verification = experience + identity only — users build their own accuracy reputation through performance. Analogy: a verified doctor on Reddit is more credible, but DUG is not giving medical advice.

**Pricing Bands**
Current bands ($50 / $100–$200 / $200–$500 / $500+) are placeholders only. Leave fully configurable per-engagement within tier-allowed ranges at launch.

**Dojo → Tier 1 Promotion**
Starting criteria: 5+ submitted cases, 3+ at Difficulty 3+, score above 70th percentile in chosen specialty. Long-term goal: dynamic, peer-and-performance-driven reputation system. Near-term: high bar, manually verified by Jimmy while system trains, then automates over time.

**Terminology (LOCKED — deployed)**
- Engagements (not Jobs, Mandates, or Briefs)
- The Network (not The Guild or The Bench)
- Consulting-style language throughout all copy, URLs, badges, and in-app strings
- Routes updated: `/engagements`, `/post-engagement`, `/dashboard/engagements`
- Old URLs redirect permanently (301s in next.config.ts)

## Pending
- Resend email wiring
- More Dojo cases (only 1 seeded so far)
- Dojo contests + leaderboards (UI present, backend not built)
- Payment/subscription model (see Revenue Model doc in `Docs/`)
- T&Cs update to reflect attestation-only trust model + liability language
- Reputation Index implementation (replace "accuracy" in public copy)
- Pricing configurability per-engagement

## Key docs in `Docs/`
- `DUG - Scaffolding Brief.docx`
- `DUG_Build_Session_Summary_May2026.docx`
- `DUG - Revenue Model & Embedded Products Strategy.docx`
- `DUG - Insurance & Legal Exposure Roadmap.docx`
- `DUG - Partnership Outreach Framework.docx`

## Notes
- Next.js App Router — all routes are in `src/app/`
- `.env.local` is populated for local dev
- Mascot is "Digger" the mole — full logo suite in `logo-assets/`
