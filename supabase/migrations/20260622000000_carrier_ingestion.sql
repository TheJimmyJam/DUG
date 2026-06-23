-- =============================================================================
-- DUG carrier ingestion MVP
-- =============================================================================

-- -----------------------------------------------------------------------------
-- enums
-- -----------------------------------------------------------------------------
do $$ begin
  create type carrier_import_format as enum ('csv', 'xlsx', 'pdf', 'manual');
exception when duplicate_object then null; end $$;

do $$ begin
  create type carrier_batch_status as enum ('pending', 'mapping', 'imported', 'ready_for_review');
exception when duplicate_object then null; end $$;

do $$ begin
  create type carrier_case_exclusion_reason as enum ('non_response', 'ai_declined', 'pricing_dispute', 'other');
exception when duplicate_object then null; end $$;

do $$ begin
  create type carrier_case_status as enum ('new', 'in_review', 'completed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type carrier_case_recommendation as enum ('write', 'decline', 'write_with_modifications');
exception when duplicate_object then null; end $$;

-- -----------------------------------------------------------------------------
-- tables
-- -----------------------------------------------------------------------------
create table if not exists public.carriers (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  contact_email text,
  created_at   timestamptz default now()
);

create table if not exists public.carrier_users (
  id           uuid primary key default gen_random_uuid(),
  carrier_id   uuid not null references public.carriers(id) on delete cascade,
  email        text unique not null,
  auth_id      uuid references auth.users(id) on delete set null,
  created_at   timestamptz default now()
);

create table if not exists public.import_batches (
  id            uuid primary key default gen_random_uuid(),
  carrier_id    uuid not null references public.carriers(id) on delete cascade,
  source_format carrier_import_format,
  field_mapping jsonb,
  raw_file_url  text,
  imported_by   uuid references public.profiles(id) on delete set null,
  status        carrier_batch_status not null default 'pending',
  created_at    timestamptz default now()
);

create table if not exists public.carrier_cases (
  id                    uuid primary key default gen_random_uuid(),
  batch_id              uuid references public.import_batches(id) on delete set null,
  carrier_id            uuid not null references public.carriers(id) on delete cascade,
  line_of_business      text,
  exposure_basis_type   text,
  exposure_basis_value  numeric,
  construction_type     text,
  protection_class      text,
  loss_history_summary  text,
  coverage_requested    text,
  exclusion_reason      carrier_case_exclusion_reason,
  named_insured         text not null,
  status                carrier_case_status not null default 'new',
  assigned_underwriter_id uuid references public.profiles(id) on delete set null,
  created_at            timestamptz default now()
);

create table if not exists public.carrier_case_analyses (
  id                      uuid primary key default gen_random_uuid(),
  case_id                 uuid not null references public.carrier_cases(id) on delete cascade,
  underwriter_id          uuid not null references public.profiles(id) on delete cascade,
  key_exposures           text,
  missing_information     text,
  recommendation          carrier_case_recommendation,
  suggested_price_structure text,
  reasoning               text,
  created_at              timestamptz default now()
);

-- -----------------------------------------------------------------------------
-- profiles column
-- -----------------------------------------------------------------------------
alter table public.profiles
  add column if not exists is_carrier_reviewer boolean not null default false;

-- -----------------------------------------------------------------------------
-- underwriter-safe view (no named_insured)
-- -----------------------------------------------------------------------------
create or replace view public.carrier_cases_underwriter_view as
  select
    id,
    batch_id,
    carrier_id,
    line_of_business,
    exposure_basis_type,
    exposure_basis_value,
    construction_type,
    protection_class,
    loss_history_summary,
    coverage_requested,
    exclusion_reason,
    status,
    assigned_underwriter_id,
    created_at
  from public.carrier_cases;

-- -----------------------------------------------------------------------------
-- RLS
-- -----------------------------------------------------------------------------
alter table public.carriers enable row level security;
alter table public.carrier_users enable row level security;
alter table public.import_batches enable row level security;
alter table public.carrier_cases enable row level security;
alter table public.carrier_case_analyses enable row level security;

-- carriers
drop policy if exists "Admin manage carriers" on public.carriers;
create policy "Admin manage carriers" on public.carriers
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

-- carrier_users
drop policy if exists "Admin manage carrier_users" on public.carrier_users;
create policy "Admin manage carrier_users" on public.carrier_users
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

drop policy if exists "Carrier user select own" on public.carrier_users;
create policy "Carrier user select own" on public.carrier_users
  for select using (auth_id = auth.uid());

-- import_batches
drop policy if exists "Admin manage import_batches" on public.import_batches;
create policy "Admin manage import_batches" on public.import_batches
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

-- carrier_cases
drop policy if exists "Admin manage carrier_cases" on public.carrier_cases;
create policy "Admin manage carrier_cases" on public.carrier_cases
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

drop policy if exists "Reviewer select assigned cases" on public.carrier_cases;
create policy "Reviewer select assigned cases" on public.carrier_cases
  for select using (
    assigned_underwriter_id = auth.uid()
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and is_carrier_reviewer = true
    )
  );

drop policy if exists "Carrier user select own cases" on public.carrier_cases;
create policy "Carrier user select own cases" on public.carrier_cases
  for select using (
    exists (
      select 1 from public.carrier_users
      where carrier_users.carrier_id = carrier_cases.carrier_id
        and carrier_users.auth_id = auth.uid()
    )
  );

-- carrier_case_analyses
drop policy if exists "Admin manage analyses" on public.carrier_case_analyses;
create policy "Admin manage analyses" on public.carrier_case_analyses
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

drop policy if exists "Reviewer manage own analyses" on public.carrier_case_analyses;
create policy "Reviewer manage own analyses" on public.carrier_case_analyses
  for all using (
    underwriter_id = auth.uid()
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and is_carrier_reviewer = true
    )
  );

drop policy if exists "Carrier user select analyses" on public.carrier_case_analyses;
create policy "Carrier user select analyses" on public.carrier_case_analyses
  for select using (
    exists (
      select 1 from public.carrier_cases cc
      join public.carrier_users cu on cu.carrier_id = cc.carrier_id
      where cc.id = carrier_case_analyses.case_id
        and cu.auth_id = auth.uid()
    )
  );

-- -----------------------------------------------------------------------------
-- indexes
-- -----------------------------------------------------------------------------
create index if not exists idx_carrier_cases_carrier_id on public.carrier_cases(carrier_id);
create index if not exists idx_carrier_cases_assigned on public.carrier_cases(assigned_underwriter_id);
create index if not exists idx_carrier_cases_status on public.carrier_cases(status);
create index if not exists idx_carrier_case_analyses_case_id on public.carrier_case_analyses(case_id);
