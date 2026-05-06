-- ============================================================
-- Ineazy client portal — schema (Phase 2)
-- Paste this into Supabase SQL Editor and click "Run".
-- Safe to re-run: every statement is idempotent.
-- ============================================================

-- ------------------------------------------------------------
-- Drop old orders scaffolding (Phase 1 leftovers)
-- ------------------------------------------------------------
drop policy if exists "Users can view own orders" on public.orders;
drop table if exists public.orders cascade;

-- ------------------------------------------------------------
-- Profiles — extends auth.users. Adds role for admin gating.
-- ------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  phone text,
  address text,
  role text not null default 'client'
    check (role in ('client', 'admin')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- If profiles already existed without role, add it.
alter table public.profiles
  add column if not exists role text not null default 'client'
    check (role in ('client', 'admin'));

-- Auto-create a profile row whenever a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ------------------------------------------------------------
-- Projects — one per client engagement.
-- ------------------------------------------------------------
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  location text,
  started_at date,
  est_handover date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists projects_client_id_idx on public.projects(client_id);

-- ------------------------------------------------------------
-- Project tasks — the timeline stages.
-- ------------------------------------------------------------
create table if not exists public.project_tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  order_index int not null,
  name text not null,
  status text not null default 'pending'
    check (status in ('pending', 'in_progress', 'completed')),
  notes text,
  est_date date,
  started_at date,
  completed_at date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists project_tasks_project_id_idx on public.project_tasks(project_id);
create index if not exists project_tasks_order_idx on public.project_tasks(project_id, order_index);

-- ------------------------------------------------------------
-- Row-level security
-- Clients: see only their own data. Admins: see and edit everything.
-- ------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.project_tasks enable row level security;

-- Helper: is the current user an admin?
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Profiles policies
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id or public.is_admin());

-- Projects policies
drop policy if exists "Clients view own project" on public.projects;
create policy "Clients view own project"
  on public.projects for select
  using (auth.uid() = client_id or public.is_admin());

drop policy if exists "Admins manage projects" on public.projects;
create policy "Admins manage projects"
  on public.projects for all
  using (public.is_admin())
  with check (public.is_admin());

-- Project tasks policies
drop policy if exists "View tasks of accessible projects" on public.project_tasks;
create policy "View tasks of accessible projects"
  on public.project_tasks for select
  using (
    public.is_admin()
    or exists (
      select 1 from public.projects p
      where p.id = project_id and p.client_id = auth.uid()
    )
  );

drop policy if exists "Admins manage tasks" on public.project_tasks;
create policy "Admins manage tasks"
  on public.project_tasks for all
  using (public.is_admin())
  with check (public.is_admin());

-- ============================================================
-- AFTER you've signed up once on the deployed app, run the
-- block below to seed yourself as admin + create a test project
-- with 5 tasks. Replace <YOUR_USER_ID> with your auth.users id
-- (find it in Supabase → Authentication → Users → click your user).
-- ============================================================
-- update public.profiles set role = 'admin' where id = '<YOUR_USER_ID>';
--
-- with new_project as (
--   insert into public.projects (client_id, name, location, started_at, est_handover)
--   values ('<YOUR_USER_ID>', 'Whitefield 3BHK', 'Whitefield, Bangalore', current_date, current_date + interval '60 days')
--   returning id
-- )
-- insert into public.project_tasks (project_id, order_index, name, status, est_date)
-- select id, ord, name, status, est_date::date from new_project,
-- (values
--   (1, 'Consultation',       'completed',   (current_date - interval '5 days')::text),
--   (2, '3D design',          'in_progress', (current_date + interval '3 days')::text),
--   (3, 'Material sourcing',  'pending',     (current_date + interval '14 days')::text),
--   (4, 'Carpentry',          'pending',     (current_date + interval '30 days')::text),
--   (5, 'Handover',           'pending',     (current_date + interval '60 days')::text)
-- ) as t(ord, name, status, est_date);
