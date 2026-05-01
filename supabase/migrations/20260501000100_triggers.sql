-- =============================================================================
-- Triggers and helper functions
-- =============================================================================

-- -----------------------------------------------------------------------------
-- updated_at maintenance
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger jobs_set_updated_at
  before update on public.jobs
  for each row execute function public.set_updated_at();

create trigger submissions_set_updated_at
  before update on public.submissions
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- New auth.users row → create matching profile
--
-- Handle is derived from email local-part with collision suffix. The user can
-- change it later in /dashboard/profile.
-- -----------------------------------------------------------------------------
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  base_handle text;
  candidate_handle text;
  suffix int := 0;
begin
  -- Extract clean handle from email or metadata
  base_handle := coalesce(
    nullif(regexp_replace(new.raw_user_meta_data->>'handle', '[^a-zA-Z0-9_-]', '', 'g'), ''),
    nullif(regexp_replace(split_part(new.email, '@', 1), '[^a-zA-Z0-9_-]', '', 'g'), ''),
    'user'
  );
  base_handle := substring(base_handle from 1 for 28);
  if length(base_handle) < 3 then
    base_handle := base_handle || repeat('x', 3 - length(base_handle));
  end if;

  candidate_handle := base_handle;
  while exists(select 1 from public.profiles where handle = candidate_handle) loop
    suffix := suffix + 1;
    candidate_handle := base_handle || suffix::text;
  end loop;

  insert into public.profiles (id, handle, display_name)
  values (
    new.id,
    candidate_handle,
    coalesce(new.raw_user_meta_data->>'display_name', candidate_handle)
  );

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

-- -----------------------------------------------------------------------------
-- Job claim: enforce status transition + stamp claimed_at
-- -----------------------------------------------------------------------------
create or replace function public.before_job_update()
returns trigger
language plpgsql
as $$
begin
  -- claimed_by must transition open -> claimed atomically
  if old.claimed_by is null and new.claimed_by is not null then
    new.status := 'claimed';
    new.claimed_at := now();
  end if;

  if new.status = 'completed' and old.status <> 'completed' then
    new.completed_at := now();
  end if;

  return new;
end;
$$;

create trigger jobs_before_update
  before update on public.jobs
  for each row execute function public.before_job_update();

-- -----------------------------------------------------------------------------
-- Review insert → recompute underwriter rating + rating_count
-- -----------------------------------------------------------------------------
create or replace function public.recompute_underwriter_rating()
returns trigger
language plpgsql
as $$
begin
  update public.profiles p
  set
    rating = coalesce((
      select round(avg(rating)::numeric, 2)
      from public.reviews
      where underwriter_id = p.id
    ), 0),
    rating_count = (
      select count(*)
      from public.reviews
      where underwriter_id = p.id
    )
  where p.id = new.underwriter_id;
  return new;
end;
$$;

create trigger reviews_recompute_rating
  after insert or update or delete on public.reviews
  for each row execute function public.recompute_underwriter_rating();

-- -----------------------------------------------------------------------------
-- Job marked completed → bump underwriter completed_job_count
-- -----------------------------------------------------------------------------
create or replace function public.bump_completed_job_count()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'completed' and (old.status is distinct from 'completed') and new.claimed_by is not null then
    update public.profiles
    set completed_job_count = completed_job_count + 1
    where id = new.claimed_by;
  end if;
  return new;
end;
$$;

create trigger jobs_bump_completed_count
  after update on public.jobs
  for each row execute function public.bump_completed_job_count();
