-- =============================================================================
-- DUG initial schema
-- =============================================================================
-- Core entities:
--   profiles            – public underwriter / poster identity (extends auth.users)
--   profile_specialties – many-to-many tags on profiles
--   jobs                – consulting assignments posted to the platform
--   submissions         – an underwriter's work product on a claimed job
--   reviews             – the poster's rating of an underwriter's submission
--   notifications       – in-app notifications
--
-- Conventions:
--   * uuid primary keys (pgcrypto / gen_random_uuid)
--   * snake_case columns
--   * created_at / updated_at on every mutable table
--   * is_demo flag on jobs so we can show a populated sandbox without
--     muddying "real" platform metrics later
-- =============================================================================

create extension if not exists "pgcrypto";
create extension if not exists "citext";

-- -----------------------------------------------------------------------------
-- enums
-- -----------------------------------------------------------------------------
create type public.profile_role as enum ('underwriter', 'poster', 'both');

create type public.job_type as enum (
  'renewal_review',
  'second_look',
  'new_business_advisory',
  'audit',
  'program_design',
  'other'
);

create type public.budget_type as enum ('hourly', 'flat', 'volunteer');

create type public.job_status as enum (
  'open',
  'claimed',
  'submitted',
  'completed',
  'cancelled'
);

create type public.recommendation as enum (
  'approve',
  'decline',
  'quote_with_modifications',
  'needs_more_info'
);

create type public.notification_type as enum (
  'new_matching_job',
  'claim_confirmed',
  'submission_received',
  'review_received',
  'job_completed'
);

-- -----------------------------------------------------------------------------
-- profiles
-- -----------------------------------------------------------------------------
create table public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  handle          citext unique not null check (handle ~ '^[a-zA-Z0-9_-]{3,32}$'),
  display_name    text not null,
  bio             text,
  location_city   text,
  location_state  text,
  years_experience integer check (years_experience >= 0 and years_experience <= 60),
  role            public.profile_role not null default 'underwriter',
  -- Reputation
  rating          numeric(3,2) not null default 0.00 check (rating >= 0 and rating <= 5),
  rating_count    integer not null default 0,
  completed_job_count integer not null default 0,
  -- Flags
  is_verified     boolean not null default false,
  is_admin        boolean not null default false,
  -- Timestamps
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index profiles_role_idx on public.profiles(role);
create index profiles_rating_idx on public.profiles(rating desc);

comment on table public.profiles is
  'Public profile for every DUG user. Created automatically when a row appears in auth.users.';
comment on column public.profiles.handle is
  'URL-safe public username (3-32 chars, alphanum/underscore/hyphen).';

-- -----------------------------------------------------------------------------
-- profile_specialties (many-to-many tags)
-- -----------------------------------------------------------------------------
create table public.profile_specialties (
  profile_id      uuid not null references public.profiles(id) on delete cascade,
  specialty_slug  text not null,
  created_at      timestamptz not null default now(),
  primary key (profile_id, specialty_slug)
);

create index profile_specialties_specialty_idx
  on public.profile_specialties(specialty_slug);

-- -----------------------------------------------------------------------------
-- jobs
-- -----------------------------------------------------------------------------
create table public.jobs (
  id                    uuid primary key default gen_random_uuid(),
  poster_id             uuid not null references public.profiles(id) on delete cascade,
  -- Content
  title                 text not null check (length(title) between 5 and 200),
  summary               text not null check (length(summary) between 20 and 500),
  description           text not null check (length(description) >= 50),
  -- Classification
  job_type              public.job_type not null,
  primary_specialty     text not null,           -- specialty slug
  additional_specialties text[] not null default '{}',
  difficulty            integer not null default 3 check (difficulty between 1 and 5),
  estimated_hours       integer check (estimated_hours > 0 and estimated_hours <= 200),
  -- Compensation
  budget_cents          integer check (budget_cents >= 0),
  budget_type           public.budget_type not null default 'flat',
  -- Lifecycle
  deadline_at           timestamptz,
  status                public.job_status not null default 'open',
  claimed_by            uuid references public.profiles(id) on delete set null,
  claimed_at            timestamptz,
  completed_at          timestamptz,
  -- Flags
  is_demo               boolean not null default false,
  -- Timestamps
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index jobs_status_idx on public.jobs(status);
create index jobs_primary_specialty_idx on public.jobs(primary_specialty);
create index jobs_poster_idx on public.jobs(poster_id);
create index jobs_claimed_by_idx on public.jobs(claimed_by);
create index jobs_created_at_idx on public.jobs(created_at desc);

comment on column public.jobs.budget_type is
  'hourly = $/hr, flat = total fixed, volunteer = unpaid (sandbox / portfolio building).';
comment on column public.jobs.is_demo is
  'Seeded sandbox data — surfaced to demo-mode users; can be filtered out later.';

-- -----------------------------------------------------------------------------
-- submissions
-- -----------------------------------------------------------------------------
create table public.submissions (
  id                      uuid primary key default gen_random_uuid(),
  job_id                  uuid not null references public.jobs(id) on delete cascade,
  underwriter_id          uuid not null references public.profiles(id) on delete cascade,
  -- The work product
  recommendation          public.recommendation not null,
  rationale               text not null check (length(rationale) >= 50),
  suggested_premium_cents integer check (suggested_premium_cents >= 0),
  suggested_terms         jsonb,                 -- { deductible, exclusions[], conditions[], ... }
  red_flags               text[] not null default '{}',
  confidence              integer not null default 3 check (confidence between 1 and 5),
  -- Timestamps
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  -- One submission per (job, underwriter)
  unique (job_id, underwriter_id)
);

create index submissions_underwriter_idx on public.submissions(underwriter_id);
create index submissions_job_idx on public.submissions(job_id);

-- -----------------------------------------------------------------------------
-- reviews
-- -----------------------------------------------------------------------------
create table public.reviews (
  id              uuid primary key default gen_random_uuid(),
  job_id          uuid not null references public.jobs(id) on delete cascade,
  submission_id   uuid not null references public.submissions(id) on delete cascade,
  poster_id       uuid not null references public.profiles(id) on delete cascade,
  underwriter_id  uuid not null references public.profiles(id) on delete cascade,
  rating          integer not null check (rating between 1 and 5),
  feedback        text,
  created_at      timestamptz not null default now(),
  -- One review per submission (poster can't double-rate)
  unique (submission_id)
);

create index reviews_underwriter_idx on public.reviews(underwriter_id);
create index reviews_created_at_idx on public.reviews(created_at desc);

-- -----------------------------------------------------------------------------
-- notifications
-- -----------------------------------------------------------------------------
create table public.notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  type        public.notification_type not null,
  title       text not null,
  body        text,
  link        text,
  read_at     timestamptz,
  created_at  timestamptz not null default now()
);

create index notifications_user_unread_idx
  on public.notifications(user_id, created_at desc)
  where read_at is null;
