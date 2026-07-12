-- ============================================================
-- FIX ADMIN RLS POLICIES & ENABLE REALTIME FOR ADMIN CENTER
-- ============================================================

-- 1. Ensure columns exist on profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;
-- CMD
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_instructor boolean DEFAULT false;
-- CMD

-- 2. Drop the old function first if it exists
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;
-- CMD

-- 3. Redefine is_admin() using auth.jwt() to prevent infinite recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM auth.users
    WHERE id = auth.uid()
      AND lower(email) IN (
        'harideepsingh13@gmail.com',
        'kishansingh.nmims@gmail.com',
        'contact@nextgenpharma.org'
      )
  );
$$;
-- CMD

-- 4. Update the handle_new_user() trigger function to sync roles and is_admin
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role, is_admin)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    new.email,
    CASE
      WHEN lower(new.email) IN (
        'harideepsingh13@gmail.com',
        'kishansingh.nmims@gmail.com',
        'contact@nextgenpharma.org'
      ) THEN 'admin'
      ELSE 'learner'
    END,
    CASE
      WHEN lower(new.email) IN (
        'harideepsingh13@gmail.com',
        'kishansingh.nmims@gmail.com',
        'contact@nextgenpharma.org'
      ) THEN true
      ELSE false
    END
  )
  ON CONFLICT (id) DO UPDATE
    SET email = excluded.email,
        full_name = COALESCE(excluded.full_name, profiles.full_name),
        role = excluded.role,
        is_admin = excluded.is_admin;
  RETURN new;
END;
$$;
-- CMD

-- 5. Force update existing admin users in the database
UPDATE public.profiles
SET role = 'admin', is_admin = true
WHERE lower(email) IN (
  'harideepsingh13@gmail.com',
  'kishansingh.nmims@gmail.com',
  'contact@nextgenpharma.org'
);
-- CMD

-- 6. Re-create RLS Policies on profiles table
-- Drop any overlapping select/update/delete policies
DROP POLICY IF EXISTS "profiles read own" ON public.profiles;
-- CMD
DROP POLICY IF EXISTS "profiles read own or admin" ON public.profiles;
-- CMD
DROP POLICY IF EXISTS "profiles read all for admin" ON public.profiles;
-- CMD
DROP POLICY IF EXISTS "profiles update own" ON public.profiles;
-- CMD
DROP POLICY IF EXISTS "profiles update own or admin" ON public.profiles;
-- CMD
DROP POLICY IF EXISTS "profiles update all for admin" ON public.profiles;
-- CMD
DROP POLICY IF EXISTS "profiles insert own" ON public.profiles;
-- CMD
DROP POLICY IF EXISTS "admins manage profiles" ON public.profiles;
-- CMD

-- Create policies
CREATE POLICY "profiles read own"
ON public.profiles FOR SELECT
USING (id = auth.uid());
-- CMD

CREATE POLICY "profiles read all for admin"
ON public.profiles FOR SELECT
USING (public.is_admin());
-- CMD

CREATE POLICY "profiles update own"
ON public.profiles FOR UPDATE
USING (id = auth.uid())
WITH CHECK (id = auth.uid());
-- CMD

CREATE POLICY "profiles update all for admin"
ON public.profiles FOR UPDATE
USING (public.is_admin())
WITH CHECK (public.is_admin());
-- CMD

CREATE POLICY "profiles insert own"
ON public.profiles FOR INSERT
WITH CHECK (id = auth.uid());
-- CMD

CREATE POLICY "admins manage profiles"
ON public.profiles FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());
-- CMD

-- 7. Safely enable Realtime replication for key tables
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'profiles'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'enrollments'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.enrollments;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'user_subscriptions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.user_subscriptions;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'contact_submissions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.contact_submissions;
  END IF;
END;
$$;
