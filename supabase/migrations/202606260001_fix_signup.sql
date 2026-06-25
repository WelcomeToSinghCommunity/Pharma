-- Safe fix: create profiles table and signup trigger
-- Run this in Supabase SQL Editor if the full migration hasn't applied yet

-- 1. Create profiles table if it doesn't exist
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  email text,
  avatar_url text,
  role text default 'learner' check (role in ('learner', 'admin')),
  created_at timestamptz default now()
);

-- 2. Enable RLS
alter table public.profiles enable row level security;

-- 3. Drop and recreate policies safely
drop policy if exists "profiles read own or admin" on public.profiles;
drop policy if exists "profiles update own or admin" on public.profiles;
drop policy if exists "admins manage profiles" on public.profiles;
drop policy if exists "profiles read own" on public.profiles;
drop policy if exists "profiles update own" on public.profiles;
drop policy if exists "profiles insert own" on public.profiles;

-- 4. Allow users to read/update their own profile (no admin check yet, safe for bootstrap)
create policy "profiles read own"
on public.profiles for select
using (id = auth.uid());

create policy "profiles update own"
on public.profiles for update
using (id = auth.uid())
with check (id = auth.uid());

create policy "profiles insert own"
on public.profiles for insert
with check (id = auth.uid());

-- 5. Recreate the signup trigger function
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.email,
    case
      when lower(new.email) in (
        'harideepsingh13@gmail.com',
        'kishansingh.nmims@gmail.com'
      ) then 'admin'
      else 'learner'
    end
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(excluded.full_name, profiles.full_name);
  return new;
end;
$$;

-- 6. Recreate the trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
