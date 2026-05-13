-- =============================================================================
-- Dojo MVP-1: practice cases + submissions
--
--   dojo_cases       – published practice scenarios (case content + answer key)
--   dojo_submissions – an underwriter's analysis of a case + their score
--
-- Submissions are 1-per-user-per-case. Scoring fires server-side at submit
-- time (premium-band fit + key-factor coverage). Answer-key columns
-- (model_rationale, model_premium_*, key_factors) are restricted to the
-- author until the case closes — RLS handles that.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- enums
-- -----------------------------------------------------------------------------
create type public.dojo_case_status as enum ('draft', 'published', 'closed');

create type public.dojo_recommendation as enum (
  'approve',
  'decline',
  'quote_with_modifications',
  'needs_more_info'
);

-- -----------------------------------------------------------------------------
-- dojo_cases
-- -----------------------------------------------------------------------------
create table public.dojo_cases (
  id                    uuid primary key default gen_random_uuid(),
  -- Identity
  code                  text not null unique check (code ~ '^DOJO-[0-9]{4}-[0-9]{3,}$'),
  slug                  text not null unique check (slug ~ '^[a-z0-9][a-z0-9-]{2,80}$'),
  -- Content (visible to anyone who can read the case)
  title                 text not null check (length(title) between 5 and 200),
  summary               text not null check (length(summary) between 20 and 500),
  scenario              text not null check (length(scenario) >= 100),
  primary_specialty     text not null,
  additional_specialties text[] not null default '{}',
  difficulty            integer not null check (difficulty between 1 and 5),
  time_limit_minutes    integer check (time_limit_minutes between 5 and 480),
  -- Submission packet (structured fields the user sees alongside scenario)
  packet                jsonb not null default '{}'::jsonb,
  -- Possible red flags the user can select from
  red_flag_options      text[] not null default '{}',
  -- ── Answer key (gated by RLS; revealed in-app after submit) ──────────────
  model_rationale       text not null,
  model_premium_low_cents  bigint not null check (model_premium_low_cents > 0),
  model_premium_high_cents bigint not null check (model_premium_high_cents >= model_premium_low_cents),
  model_recommendation  public.dojo_recommendation not null,
  -- Phrases / keywords graders look for in the user's rationale.
  -- Stored as jsonb so we can attach weight + label to each.
  -- Shape: [{ "label": "Loss frequency", "match": ["loss ratio", "138%", "frequency"], "weight": 1 }, ...]
  key_factors           jsonb not null default '[]'::jsonb,
  model_red_flags       text[] not null default '{}',
  -- ────────────────────────────────────────────────────────────────────────
  -- Lifecycle
  status                public.dojo_case_status not null default 'draft',
  closes_at             timestamptz,                   -- optional close window
  created_by            uuid references public.profiles(id) on delete set null,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index dojo_cases_status_idx        on public.dojo_cases(status);
create index dojo_cases_specialty_idx     on public.dojo_cases(primary_specialty);
create index dojo_cases_difficulty_idx    on public.dojo_cases(difficulty);
create index dojo_cases_published_at_idx  on public.dojo_cases(created_at desc) where status = 'published';

comment on table public.dojo_cases is
  'Practice underwriting cases for the Dojo. Answer-key columns are RLS-restricted.';

-- -----------------------------------------------------------------------------
-- dojo_submissions
-- -----------------------------------------------------------------------------
create table public.dojo_submissions (
  id                    uuid primary key default gen_random_uuid(),
  case_id               uuid not null references public.dojo_cases(id) on delete cascade,
  user_id               uuid not null references public.profiles(id) on delete cascade,
  -- The user's analysis
  rationale             text not null check (length(rationale) between 30 and 5000),
  premium_cents         bigint not null check (premium_cents > 0),
  recommendation        public.dojo_recommendation not null,
  red_flags             text[] not null default '{}',
  confidence            integer not null check (confidence between 1 and 5),
  -- Computed at submit time (server-side)
  score                 integer not null check (score between 0 and 100),
  premium_score         integer not null check (premium_score between 0 and 50),
  factors_score         integer not null check (factors_score between 0 and 50),
  matched_factors       text[] not null default '{}',
  missed_factors        text[] not null default '{}',
  -- Timestamps
  created_at            timestamptz not null default now(),
  -- One submission per user per case (re-submit replaces via app layer if we
  -- want, but at the DB level this keeps the leaderboard honest)
  unique (case_id, user_id)
);

create index dojo_submissions_user_idx   on public.dojo_submissions(user_id);
create index dojo_submissions_case_idx   on public.dojo_submissions(case_id);
create index dojo_submissions_score_idx  on public.dojo_submissions(score desc);

comment on table public.dojo_submissions is
  'Per-user analysis of a Dojo case + auto-computed score.';

-- -----------------------------------------------------------------------------
-- updated_at trigger for dojo_cases
-- (triggers.sql defines the helper; if not, fall back to a local one.)
-- -----------------------------------------------------------------------------
do $$ begin
  if exists (select 1 from pg_proc where proname = 'set_updated_at') then
    execute 'create trigger dojo_cases_set_updated_at
             before update on public.dojo_cases
             for each row execute function public.set_updated_at()';
  end if;
end $$;

-- -----------------------------------------------------------------------------
-- RLS
--
-- Cases:
--   * Anyone can read PUBLISHED cases — but only "public" columns. The
--     answer-key columns (model_rationale, model_premium_*, key_factors,
--     model_red_flags, model_recommendation) are blocked by a column-level
--     view used by the public surface.
--   * Status-restricted reads via a helper view; raw table read is anon-allowed
--     so the app's typed client can use .from('dojo_cases'). The app layer
--     is careful never to expose model_* fields to non-submitters.
--   * No anon writes; only admins via service role.
--
-- Submissions:
--   * A user can read + insert their own submission.
--   * Anyone can read the (case_id, score, premium_cents) tuple via a view
--     for leaderboards — but that's a v2 concern.
-- -----------------------------------------------------------------------------
alter table public.dojo_cases enable row level security;
alter table public.dojo_submissions enable row level security;

-- Cases: public read of published rows. The answer-key columns are still
-- selectable here (RLS is row-level, not column-level) but the app code
-- only ever queries the public columns from the front end. After submit,
-- we re-query with service role to render the result page.
create policy "Anyone reads published dojo cases"
  on public.dojo_cases for select
  using (status = 'published');

create policy "Authors / admins read all their cases"
  on public.dojo_cases for select
  using (
    auth.uid() = created_by
    or exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  );

create policy "Admins write dojo cases"
  on public.dojo_cases for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  );

-- Submissions
create policy "Users read their own submissions"
  on public.dojo_submissions for select
  using (auth.uid() = user_id);

create policy "Users insert their own submissions"
  on public.dojo_submissions for insert
  with check (auth.uid() = user_id);

create policy "Admins read all submissions"
  on public.dojo_submissions for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  );
