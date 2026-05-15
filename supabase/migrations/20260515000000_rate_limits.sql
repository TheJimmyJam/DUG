-- =============================================================================
-- Rate limiting infrastructure for bot defense (MVP).
--
-- Single sliding-window-ish counter per key. Cheap, fast, and good enough for
-- MVP. Upgrade to a redis-backed system or Postgres token bucket if/when
-- volume justifies it.
--
-- Usage from server actions:
--   select public.check_rate_limit('signup:ip:1.2.3.4', 3, 3600);
--   -> jsonb { allowed: true|false, count, max, retry_after_seconds }
--
-- Keys follow the convention:
--   <action>:<scope>:<identifier>
-- Examples:
--   signup:ip:1.2.3.4
--   login:ip:1.2.3.4
--   post_engagement:user:<uuid>
--   dojo_submit:user:<uuid>
-- =============================================================================

create table if not exists public.rate_limits (
  key            text primary key,
  window_start   timestamptz not null default now(),
  count          integer     not null default 0,
  updated_at     timestamptz not null default now()
);

create index if not exists rate_limits_updated_at_idx
  on public.rate_limits(updated_at);

comment on table public.rate_limits is
  'Sliding-window rate-limit counters. Accessed only via check_rate_limit().';

-- -----------------------------------------------------------------------------
-- check_rate_limit(key, max_count, window_seconds)
--
-- Atomically increments the counter for `key` and returns a JSON verdict.
-- If the current window has expired (now() - window_start > window_seconds)
-- the counter resets to 1 and a new window begins.
-- -----------------------------------------------------------------------------
create or replace function public.check_rate_limit(
  p_key text,
  p_max_count integer,
  p_window_seconds integer
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.rate_limits%rowtype;
  v_now timestamptz := now();
  v_window_age integer;
begin
  if p_key is null or p_max_count is null or p_window_seconds is null then
    raise exception 'check_rate_limit: all parameters required';
  end if;

  insert into public.rate_limits (key, window_start, count, updated_at)
  values (p_key, v_now, 1, v_now)
  on conflict (key) do update
  set
    count = case
      when public.rate_limits.window_start
           < v_now - (p_window_seconds || ' seconds')::interval
      then 1
      else public.rate_limits.count + 1
    end,
    window_start = case
      when public.rate_limits.window_start
           < v_now - (p_window_seconds || ' seconds')::interval
      then v_now
      else public.rate_limits.window_start
    end,
    updated_at = v_now
  returning * into v_row;

  if v_row.count > p_max_count then
    v_window_age := extract(epoch from (v_now - v_row.window_start))::integer;
    return jsonb_build_object(
      'allowed', false,
      'count', v_row.count,
      'max', p_max_count,
      'retry_after_seconds', greatest(0, p_window_seconds - v_window_age)
    );
  end if;

  return jsonb_build_object(
    'allowed', true,
    'count', v_row.count,
    'max', p_max_count,
    'retry_after_seconds', 0
  );
end;
$$;

comment on function public.check_rate_limit(text, integer, integer) is
  'Atomic rate-limit check. Returns jsonb { allowed, count, max, retry_after_seconds }.';

-- -----------------------------------------------------------------------------
-- RLS — table is fully locked down; only the SECURITY DEFINER function reads
-- or writes. Callers should never `select * from rate_limits` directly.
-- -----------------------------------------------------------------------------
alter table public.rate_limits enable row level security;

-- No policies means no row access. Function bypasses via security definer.

-- Allow anon + authenticated to invoke the RPC.
grant execute on function public.check_rate_limit(text, integer, integer)
  to anon, authenticated;

-- -----------------------------------------------------------------------------
-- Optional housekeeping: a function to prune stale rows (run periodically).
-- We won't schedule this in MVP — Postgres can carry a few million rows easily.
-- -----------------------------------------------------------------------------
create or replace function public.prune_rate_limits(p_older_than_seconds integer default 86400)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_deleted integer;
begin
  delete from public.rate_limits
  where updated_at < now() - (p_older_than_seconds || ' seconds')::interval;
  get diagnostics v_deleted = row_count;
  return v_deleted;
end;
$$;

comment on function public.prune_rate_limits(integer) is
  'Delete rate-limit rows older than N seconds (default 24h).';
