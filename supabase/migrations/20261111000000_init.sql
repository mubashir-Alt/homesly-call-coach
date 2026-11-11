-- Homesly Call Coach: database schema, access rules and sign-up rules.

-- App settings (one row) ---------------------------------------------------
create table public.app_settings (
  id int primary key default 1 check (id = 1),
  -- Only these email domains can create accounts. Empty array = anyone.
  allowed_domains text[] not null default '{homeslystays.com}',
  -- AI calls per person per day (guest replies + scoring + summaries).
  daily_ai_limit int not null default 300
);
insert into public.app_settings default values;

-- People -------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text not null default '',
  role text not null default 'trainee' check (role in ('trainee', 'manager')),
  team text not null default 'sales' check (team in ('sales', 'support')),
  created_at timestamptz not null default now()
);

-- Results ------------------------------------------------------------------
create table public.attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  pack text not null,
  kind text not null check (kind in ('roleplay', 'drill')),
  item_id text not null,
  title text not null,
  score int not null,
  outcome text,
  summary text,
  criteria jsonb,
  strengths jsonb,
  improvements jsonb,
  better_lines jsonb,
  transcript jsonb,
  targets text[],
  day date not null,
  created_at timestamptz not null default now()
);
create index attempts_user_created on public.attempts (user_id, created_at desc);

create table public.day_notes (
  user_id uuid not null references public.profiles (id) on delete cascade,
  day date not null,
  note text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, day)
);

create table public.ai_usage (
  user_id uuid not null references public.profiles (id) on delete cascade,
  day date not null,
  calls int not null default 0,
  primary key (user_id, day)
);

-- Helpers ------------------------------------------------------------------
create function public.is_manager() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'manager');
$$;

-- Called by the backend (service role) before every AI call.
create function public.bump_ai_usage(p_user uuid, p_day date)
returns table (calls int, daily_limit int)
language plpgsql security definer set search_path = public as $$
#variable_conflict use_column
begin
  insert into public.ai_usage as u (user_id, day, calls) values (p_user, p_day, 1)
  on conflict (user_id, day) do update set calls = u.calls + 1;
  return query
    select u.calls, s.daily_ai_limit from public.ai_usage u, public.app_settings s
    where u.user_id = p_user and u.day = p_day and s.id = 1;
end;
$$;
revoke execute on function public.bump_ai_usage(uuid, date) from public, anon, authenticated;

-- Sign-up: company emails only; the very first account becomes a manager.
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  domains text[];
  dom text := lower(split_part(new.email, '@', 2));
begin
  select allowed_domains into domains from public.app_settings where id = 1;
  if coalesce(array_length(domains, 1), 0) > 0 and not (dom = any (domains)) then
    raise exception 'Sign-ups are limited to company email addresses';
  end if;
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    lower(new.email),
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    case when exists (select 1 from public.profiles where role = 'manager') then 'trainee' else 'manager' end
  );
  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Only managers (or the backend / SQL editor) can change roles, teams or emails.
create function public.protect_profile() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if (new.role is distinct from old.role or new.team is distinct from old.team
      or new.email is distinct from old.email or new.id is distinct from old.id)
     and coalesce(auth.jwt() ->> 'role', 'service_role') <> 'service_role'
     and not public.is_manager() then
    raise exception 'Only managers can change roles or teams';
  end if;
  return new;
end;
$$;
create trigger profiles_protect before update on public.profiles
  for each row execute function public.protect_profile();

-- Row level security -------------------------------------------------------
alter table public.app_settings enable row level security;
alter table public.profiles enable row level security;
alter table public.attempts enable row level security;
alter table public.day_notes enable row level security;
alter table public.ai_usage enable row level security;

create policy "settings readable by signed-in users" on public.app_settings
  for select to authenticated using (true);
create policy "settings editable by managers" on public.app_settings
  for update to authenticated using (public.is_manager()) with check (public.is_manager());

create policy "see own profile, managers see all" on public.profiles
  for select to authenticated using (id = auth.uid() or public.is_manager());
create policy "edit own profile, managers edit all" on public.profiles
  for update to authenticated using (id = auth.uid() or public.is_manager())
  with check (id = auth.uid() or public.is_manager());

-- Results are written only by the backend, so scores can't be faked.
create policy "see own results, managers see all" on public.attempts
  for select to authenticated using (user_id = auth.uid() or public.is_manager());
create policy "managers delete results" on public.attempts
  for delete to authenticated using (public.is_manager());

create policy "see own notes, managers see all" on public.day_notes
  for select to authenticated using (user_id = auth.uid() or public.is_manager());

create policy "see own usage, managers see all" on public.ai_usage
  for select to authenticated using (user_id = auth.uid() or public.is_manager());
