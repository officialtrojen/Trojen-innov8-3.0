-- ============================================================
-- FormFlow — Supabase Auth & User Profiles Setup Script
-- Paste & Run in Supabase SQL Editor:
-- Dashboard -> SQL Editor -> New Query -> Paste & Run
-- ============================================================

-- 1. Create Public User Profiles Table linked to Supabase Auth
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  email text not null,
  avatar_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable Row Level Security (RLS)
alter table public.profiles enable row level security;

-- Drop old policies
drop policy if exists "Users can view their own profile" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;
drop policy if exists "Service role can insert profiles" on public.profiles;
drop policy if exists "Allow profile select" on public.profiles;
drop policy if exists "Allow profile insert" on public.profiles;
drop policy if exists "Allow profile update" on public.profiles;

-- RLS Policies for Profiles
create policy "Allow profile select" on public.profiles
  for select using (true);

create policy "Allow profile insert" on public.profiles
  for insert with check (true);

create policy "Allow profile update" on public.profiles
  for update using (auth.uid() = id);

-- 2. Automatic Profile Creation Trigger on User Sign Up (Email & Google OAuth)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data->>'name',
      new.raw_user_meta_data->>'full_name',
      split_part(coalesce(new.email, ''), '@', 1),
      'User'
    ),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do update set
    name = excluded.name,
    email = excluded.email,
    avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
    updated_at = now();
  return new;
exception
  when others then
    -- Never abort user creation if profile insert has an issue
    raise warning 'handle_new_user failed: %', sqlerrm;
    return new;
end;
$$ language plpgsql security definer set search_path = public;

-- Create Trigger on auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
