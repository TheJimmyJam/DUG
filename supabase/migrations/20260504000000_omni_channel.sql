-- =============================================================================
-- DUG omni-channel expansion
-- Adds requester_type to jobs and expands job_type enum.
-- =============================================================================

-- New job type values for non-carrier channels
alter type public.job_type add value if not exists 'pre_broker_consult';
alter type public.job_type add value if not exists 'coverage_dispute';
alter type public.job_type add value if not exists 'ai_benchmark';
alter type public.job_type add value if not exists 'pricing_review';
alter type public.job_type add value if not exists 'risk_assessment';

-- Who is posting the request — carrier, insured, broker, AI lab, etc.
create type public.requester_type as enum (
  'carrier',
  'mga',
  'reinsurer',
  'broker',
  'agent',
  'risk_manager',
  'insured_commercial',
  'insured_personal',
  'tech_ai',
  'other'
);

-- Add to jobs (nullable — existing rows left null, all new rows required in app layer)
alter table public.jobs
  add column requester_type public.requester_type;

comment on column public.jobs.requester_type is
  'Who is requesting the underwriting evaluation. Null on pre-migration rows.';

-- Index so we can filter/facet by requester type on the board
create index jobs_requester_type_idx on public.jobs(requester_type);
