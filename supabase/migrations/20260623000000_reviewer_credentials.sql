-- =============================================================================
-- Carrier reviewer credentials
--
-- Adds two self-reported fields to profiles:
--   linkedin_url  – reviewer's LinkedIn profile URL
--   is_cpcu       – whether reviewer holds a CPCU designation
--
-- Used to surface a "Verified Reviewer" badge on the carrier dashboard
-- without revealing the reviewer's identity.
-- =============================================================================

alter table public.profiles
  add column if not exists linkedin_url text,
  add column if not exists is_cpcu boolean not null default false;

comment on column public.profiles.linkedin_url is
  'Self-reported LinkedIn profile URL. Used to surface reviewer credibility on the carrier dashboard.';

comment on column public.profiles.is_cpcu is
  'Self-reported CPCU designation. Used to surface reviewer credibility on the carrier dashboard.';
