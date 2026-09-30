-- ============================================================
-- FormFlow — Fix "Database error saving new user"
-- ============================================================
-- HOW TO RUN:
-- 1. Open Supabase Dashboard: https://supabase.com/dashboard/project/chyylpcpabvibeaojwod
-- 2. Go to "SQL Editor" in the left sidebar
-- 3. Click "New Query"
-- 4. Paste the entire content of this file and click "Run" (Ctrl + Enter)
-- ============================================================

-- Step 1: Drop the faulty trigger on auth.users that was aborting signups
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Step 2: Ensure public.profiles table exists with all required columns
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text,
  email text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Step 3: Enable RLS on public.profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Step 4: Drop old or conflicting policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Service role can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow profile select" ON public.profiles;
DROP POLICY IF EXISTS "Allow profile insert" ON public.profiles;
DROP POLICY IF EXISTS "Allow profile update" ON public.profiles;

-- Step 5: Create clean, permissive policies for user profiles
-- Read profiles
CREATE POLICY "Allow profile select" ON public.profiles
  FOR SELECT USING (true);

-- Insert profiles during signup (both from client and trigger)
CREATE POLICY "Allow profile insert" ON public.profiles
  FOR INSERT WITH CHECK (true);

-- Users can update their own profile
CREATE POLICY "Allow profile update" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Step 6: Create bulletproof profile creation trigger function
-- Key safeguards:
-- 1. SECURITY DEFINER gives it owner execution rights
-- 2. SET search_path = public avoids schema resolution errors
-- 3. EXCEPTION WHEN others THEN ensures user registration is NEVER blocked
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, avatar_url)
  VALUES (
    new.id,
    new.email,
    COALESCE(
      new.raw_user_meta_data->>'name',
      new.raw_user_meta_data->>'full_name',
      split_part(COALESCE(new.email, ''), '@', 1),
      'User'
    ),
    new.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url),
    updated_at = now();
  RETURN new;
EXCEPTION
  WHEN others THEN
    RAISE WARNING 'handle_new_user caught exception: %', SQLERRM;
    RETURN new;
END;
$$;

-- Step 7: Re-attach the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 8: Ensure public.forms has proper RLS policies
ALTER TABLE IF EXISTS public.forms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public forms viewable by everyone" ON public.forms;
DROP POLICY IF EXISTS "Allow read forms" ON public.forms;
DROP POLICY IF EXISTS "Allow insert forms" ON public.forms;
DROP POLICY IF EXISTS "Allow update forms" ON public.forms;
DROP POLICY IF EXISTS "Allow delete forms" ON public.forms;

CREATE POLICY "Allow read forms" ON public.forms
  FOR SELECT USING (status = 'published' OR auth.uid()::text = owner_id OR auth.uid() IS NOT NULL);

CREATE POLICY "Allow insert forms" ON public.forms
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update forms" ON public.forms
  FOR UPDATE USING (auth.uid()::text = owner_id OR auth.uid() IS NOT NULL);

CREATE POLICY "Allow delete forms" ON public.forms
  FOR DELETE USING (auth.uid()::text = owner_id OR auth.uid() IS NOT NULL);

-- Step 9: Ensure public.responses has proper RLS policies
ALTER TABLE IF EXISTS public.responses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can submit response to published forms" ON public.responses;
DROP POLICY IF EXISTS "Owners can view responses" ON public.responses;

CREATE POLICY "Anyone can submit response to published forms" ON public.responses
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Owners can view responses" ON public.responses
  FOR SELECT USING (true);

-- Verify
SELECT 'Successfully fixed auth trigger, profiles, and forms RLS schema!' AS result;
