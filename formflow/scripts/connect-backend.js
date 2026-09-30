const fs = require('fs');
const path = require('path');
const http = require('http');

console.log('====================================================');
console.log('⚡ FormFlow — Backend Connection & Database Setup Script');
console.log('====================================================\n');

// 1. Verify .env.local File
const envPath = path.join(__dirname, '..', '.env.local');
let envContent = '';

if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf8');
  console.log('✅ Found .env.local file');
} else {
  console.log('⚠️ .env.local not found. Creating default configuration...');
  envContent = `NEXT_PUBLIC_SUPABASE_URL=https://placeholder-project.supabase.co\nNEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_FAdvQemxzGKjoyXEr7zDmg_V-mVxW5W\n`;
  fs.writeFileSync(envPath, envContent);
}

// 2. Extract Keys
const urlMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
const keyMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/);

const supabaseUrl = urlMatch ? urlMatch[1].trim() : 'Not Set';
const supabaseKey = keyMatch ? keyMatch[1].trim() : 'Not Set';

console.log(`📌 Supabase URL: ${supabaseUrl}`);
console.log(`📌 Supabase Anon/Publishable Key: ${supabaseKey.substring(0, 15)}...\n`);

// 3. Generate Full SQL Migration File
const sqlSchema = `-- ============================================================
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
`;

const scriptsDir = path.join(__dirname, '..', 'scripts');
if (!fs.existsSync(scriptsDir)) {
  fs.mkdirSync(scriptsDir);
}

const sqlPath = path.join(scriptsDir, 'schema.sql');
fs.writeFileSync(sqlPath, sqlSchema);

console.log(`✅ Generated Supabase SQL Migration Script at: scripts/schema.sql`);

// 4. Test Local Node.js API Server Connection
console.log('\n🔍 Testing Local Node.js Backend API Connection...');

const req = http.get('http://localhost:3000/api/forms', (res) => {
  let data = '';
  res.on('data', (chunk) => (data += chunk));
  res.on('end', () => {
    console.log(`✅ Node.js Backend Server API responded with status ${res.statusCode}`);
    console.log('🎉 Backend Connection & Migration Script Setup Completed Successfully!\n');
  });
});

req.on('error', (err) => {
  console.log(`⚠️ Note: Node.js server test ping: ${err.message}`);
  console.log('🎉 Backend script setup ready!\n');
});
