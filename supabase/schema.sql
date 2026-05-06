-- ============================================================
-- User Dashboard schema
-- Paste this into Supabase SQL Editor and click "Run".
-- ============================================================

-- Profiles table — extends auth.users with extra fields.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  phone text,
  address text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Orders table.
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  order_number text not null unique,
  status text not null default 'pending'
    check (status in ('pending', 'processing', 'shipped', 'completed', 'cancelled')),
  items jsonb default '[]'::jsonb,
  total numeric(10,2) not null default 0,
  tracking_url text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists orders_user_id_idx on public.orders(user_id);
create index if not exists orders_created_at_idx on public.orders(created_at desc);

-- Auto-create a profile row whenever a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Row Level Security: each user only sees their own data.
alter table public.profiles enable row level security;
alter table public.orders enable row level security;

drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

drop policy if exists "Users can view own orders" on public.orders;
create policy "Users can view own orders"
  on public.orders for select
  using (auth.uid() = user_id);

-- ============================================================
-- Optional: seed a fake order for the currently logged-in user
-- so the dashboard isn't empty. Run AFTER you sign up once.
-- Uncomment, replace <YOUR_USER_ID> with the id from auth.users,
-- then run.
-- ============================================================
-- insert into public.orders (user_id, order_number, status, total, items)
-- values
--   ('<YOUR_USER_ID>', 'ORD-1001', 'shipped',  149.00, '[{"name":"Sample item","qty":1}]'),
--   ('<YOUR_USER_ID>', 'ORD-1002', 'pending',   59.00, '[{"name":"Another item","qty":2}]'),
--   ('<YOUR_USER_ID>', 'ORD-1003', 'completed', 230.00, '[]');
