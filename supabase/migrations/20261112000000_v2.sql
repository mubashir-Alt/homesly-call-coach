-- Levels, unique scenario variants and attendance.

-- Each trainee gets their own generated version of a lesson. A variant is never
-- given to two people (unique signature per lesson) and is only ever read by the backend.
create table public.scenario_variants (
  id uuid primary key default gen_random_uuid(),
  pack text not null,
  lesson_id text not null,
  kind text not null check (kind in ('call', 'drill')),
  user_id uuid not null references public.profiles (id) on delete cascade,
  signature text not null,
  data jsonb not null,
  created_at timestamptz not null default now(),
  unique (pack, lesson_id, signature)
);
create index scenario_variants_lesson on public.scenario_variants (pack, lesson_id, created_at desc);
alter table public.scenario_variants enable row level security;
-- No policies on purpose: hidden guest instructions must never reach the browser.
grant all on public.scenario_variants to service_role;

-- Daily check-in (first/last seen). "Present" also needs at least one session; worked out in the app.
create table public.attendance (
  user_id uuid not null references public.profiles (id) on delete cascade,
  day date not null,
  first_seen timestamptz not null default now(),
  last_seen timestamptz not null default now(),
  primary key (user_id, day)
);
alter table public.attendance enable row level security;
create policy "see own attendance, managers see all" on public.attendance
  for select to authenticated using (user_id = auth.uid() or public.is_manager());
grant select on public.attendance to authenticated;
grant all on public.attendance to service_role;

alter table public.attempts add column level int, add column variant_id uuid;
