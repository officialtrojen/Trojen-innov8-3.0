-- ============================================================
-- FormFlow — Production Supabase Schema Migration Script
-- Run this script in your Supabase SQL Editor:
-- Dashboard -> SQL Editor -> New Query -> Paste & Run
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. FORMS TABLE
create table if not exists public.forms (
  id uuid primary key default uuid_generate_v4(),
  owner_id text not null,
  title text not null,
  description text,
  schema jsonb not null default '{}'::jsonb,
  theme jsonb not null default '{}'::jsonb,
  status text not null default 'draft' check (status in ('draft', 'published', 'closed')),
  public_slug text not null unique,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 2. RESPONSES TABLE
create table if not exists public.responses (
  id uuid primary key default uuid_generate_v4(),
  form_id uuid not null references public.forms(id) on delete cascade,
  answers jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  submitted_at timestamp with time zone default now()
);

-- 3. INTEGRATIONS (WEBHOOKS) TABLE
create table if not exists public.integrations (
  id uuid primary key default uuid_generate_v4(),
  form_id uuid not null references public.forms(id) on delete cascade,
  type text not null default 'webhook',
  configuration jsonb not null default '{}'::jsonb,
  enabled boolean default true,
  created_at timestamp with time zone default now()
);

-- 4. INDEXES FOR HIGH PERFORMANCE
create index if not exists idx_forms_public_slug on public.forms(public_slug);
create index if not exists idx_forms_owner_id on public.forms(owner_id);
create index if not exists idx_responses_form_id on public.responses(form_id);
create index if not exists idx_integrations_form_id on public.integrations(form_id);

-- 5. ROW LEVEL SECURITY (RLS) POLICIES
alter table public.forms enable row level security;
alter table public.responses enable row level security;
alter table public.integrations enable row level security;

-- Public read access for forms by public_slug
create policy "Public forms viewable by everyone" on public.forms
  for select using (status = 'published');

-- Form submission policy for everyone
create policy "Anyone can submit response to published forms" on public.responses
  for insert with check (true);
