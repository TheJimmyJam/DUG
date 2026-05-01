-- =============================================================================
-- Row Level Security
--
-- Defaults: deny everything. Each table opts in via explicit policies.
--
-- Public-facing surface (anon + authenticated):
--   * profiles            – read all (it's a portfolio platform)
--   * profile_specialties – read all
--   * jobs                – read all (open jobs are public for the sandbox)
--   * reviews             – read all (drives ratings)
--
-- Owner-only writes:
--   * profiles            – owner can update their own
--   * jobs                – poster owns; claimed_by can update narrow fields
--   * submissions         – underwriter owns; only they + poster can read
--   * reviews             – poster creates after claimer submits
--   * notifications       – owner reads / marks-read their own only
-- =============================================================================

alter table public.profiles enable row level security;
alter table public.profile_specialties enable row level security;
alter table public.jobs enable row level security;
alter table public.submissions enable row level security;
alter table public.reviews enable row level security;
alter table public.notifications enable row level security;

-- -----------------------------------------------------------------------------
-- profiles
-- -----------------------------------------------------------------------------
create policy "Profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- -----------------------------------------------------------------------------
-- profile_specialties
-- -----------------------------------------------------------------------------
create policy "Specialties are viewable by everyone"
  on public.profile_specialties for select
  using (true);

create policy "Users manage their own specialties"
  on public.profile_specialties for all
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);

-- -----------------------------------------------------------------------------
-- jobs
-- -----------------------------------------------------------------------------
create policy "Jobs are viewable by everyone"
  on public.jobs for select
  using (true);

create policy "Posters can create jobs"
  on public.jobs for insert
  with check (auth.uid() = poster_id);

create policy "Posters can update their own jobs"
  on public.jobs for update
  using (auth.uid() = poster_id)
  with check (auth.uid() = poster_id);

-- Anyone authenticated can claim an open job by setting claimed_by = themselves.
-- (This is the only mutation an underwriter can make on a job they don't own.)
create policy "Authenticated users can claim open jobs"
  on public.jobs for update
  using (
    auth.uid() is not null
    and status = 'open'
    and claimed_by is null
  )
  with check (
    auth.uid() = claimed_by
    and status = 'claimed'
  );

create policy "Posters can delete their own jobs"
  on public.jobs for delete
  using (auth.uid() = poster_id);

-- -----------------------------------------------------------------------------
-- submissions
-- -----------------------------------------------------------------------------
create policy "Underwriter and poster can read submission"
  on public.submissions for select
  using (
    auth.uid() = underwriter_id
    or auth.uid() = (select poster_id from public.jobs where id = job_id)
  );

create policy "Claimed underwriter can submit"
  on public.submissions for insert
  with check (
    auth.uid() = underwriter_id
    and exists (
      select 1 from public.jobs j
      where j.id = job_id
        and j.claimed_by = auth.uid()
        and j.status in ('claimed', 'submitted')
    )
  );

create policy "Underwriter can update their own submission"
  on public.submissions for update
  using (auth.uid() = underwriter_id)
  with check (auth.uid() = underwriter_id);

-- -----------------------------------------------------------------------------
-- reviews
-- -----------------------------------------------------------------------------
create policy "Reviews are viewable by everyone"
  on public.reviews for select
  using (true);

create policy "Posters can create reviews on their jobs"
  on public.reviews for insert
  with check (
    auth.uid() = poster_id
    and exists (
      select 1 from public.jobs j
      where j.id = job_id and j.poster_id = auth.uid()
    )
  );

-- -----------------------------------------------------------------------------
-- notifications
-- -----------------------------------------------------------------------------
create policy "Users can read their own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

create policy "Users can mark their own notifications read"
  on public.notifications for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
