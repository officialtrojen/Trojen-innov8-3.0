-- ============================================================
-- FormFlow — Sync All Existing Auth Users into public.profiles
-- ============================================================
-- Run this ONCE in your Supabase SQL Editor:
-- Dashboard -> SQL Editor -> New Query -> Paste & Run
-- ============================================================

-- Step 1: Ensure profiles table and columns exist
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text,
  email text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS name text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Step 2: Ensure RLS allows select and insert
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow profile select" ON public.profiles;
DROP POLICY IF EXISTS "Allow profile insert" ON public.profiles;
DROP POLICY IF EXISTS "Allow profile update" ON public.profiles;

CREATE POLICY "Allow profile select" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Allow profile insert" ON public.profiles
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow profile update" ON public.profiles
  FOR UPDATE USING (auth.uid() = id OR auth.uid() IS NOT NULL);

-- Step 3: Backfill / Sync ALL existing users from auth.users into public.profiles immediately
INSERT INTO public.profiles (id, email, name, avatar_url, created_at, updated_at)
SELECT 
  id, 
  LOWER(email),
  COALESCE(
    raw_user_meta_data->>'name',
    raw_user_meta_data->>'full_name',
    split_part(COALESCE(email, ''), '@', 1),
    'User'
  ),
  raw_user_meta_data->>'avatar_url',
  created_at,
  now()
FROM auth.users
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  name = COALESCE(EXCLUDED.name, public.profiles.name),
  updated_at = now();

-- Step 4: Ensure the trigger is active so all future signups auto-create profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, avatar_url)
  VALUES (
    new.id,
    LOWER(new.email),
    COALESCE(
      new.raw_user_meta_data->>'name',
      new.raw_user_meta_data->>'full_name',
      split_part(COALESCE(new.email, ''), '@', 1),
      'User'
    ),
    new.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE SET
    name = COALESCE(EXCLUDED.name, public.profiles.name),
    email = COALESCE(EXCLUDED.email, public.profiles.email),
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url),
    updated_at = now();
  RETURN new;
EXCEPTION
  WHEN others THEN
    RAISE WARNING 'handle_new_user caught exception: %', SQLERRM;
    RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 5: Verify the sync result
SELECT id, email, name, avatar_url, updated_at FROM public.profiles;
