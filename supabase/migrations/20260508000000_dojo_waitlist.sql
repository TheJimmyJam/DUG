-- =============================================================================
-- Dojo waitlist
-- Public capture table for /dojo "Join the waitlist" form. Anon-writable,
-- admin-only readable. No PII beyond email + optional role hint.
-- =============================================================================

create table if not exists public.dojo_waitlist (
  id          uuid primary key default gen_random_uuid(),
  email       text not null,
  role_hint   text,        -- e.g. "claims_adjuster", "career_changer", free text
  referrer    text,        -- optional acquisition source (utm_source or hand-typed)
  user_id     uuid references auth.users(id) on delete set null,
  created_at  timestamptz not null default now()
);

-- Don't accept obvious dupes from the same browser session
create unique index if not exists dojo_waitlist_email_unique
  on public.dojo_waitlist (lower(email));

-- Lookup index for admin dashboards
create index if not exists dojo_waitlist_created_at_idx
  on public.dojo_waitlist (created_at desc);

-- -----------------------------------------------------------------------------
-- RLS
-- Anyone (anon or authenticated) can insert. No one can read except via
-- service role (admin) — handled at the app layer / Supabase studio.
-- -----------------------------------------------------------------------------
alter table public.dojo_waitlist enable row level security;

create policy "Anyone can join the dojo waitlist"
  on public.dojo_waitlist for insert
  with check (true);

-- No select policy = no one (other than service role) can read.

comment on table public.dojo_waitlist is
  'Email captures from the /dojo waitlist form. Insert-only via RLS.';
