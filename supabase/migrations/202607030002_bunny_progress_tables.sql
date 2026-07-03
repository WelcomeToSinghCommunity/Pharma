-- ============================================
-- NEXTGEN PHARMA DATABASE MIGRATION - PART 2
-- ============================================

-- 1. Add videoStreamId to lessons table if it doesn't exist
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS "videoStreamId" text;

-- 2. Create the video_progress table to track student playback progress
CREATE TABLE IF NOT EXISTS public.video_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  course_id uuid REFERENCES public.courses(id) ON DELETE CASCADE,
  video_id text NOT NULL, -- Holds the lesson ID or video ID
  timestamp_seconds integer NOT NULL DEFAULT 0,
  completed boolean NOT NULL DEFAULT false,
  last_watched_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, video_id)
);

-- Enable RLS for video_progress
ALTER TABLE public.video_progress ENABLE ROW LEVEL SECURITY;

-- Setup RLS Policies for video_progress
DROP POLICY IF EXISTS "Users can read own video progress" ON public.video_progress;
DROP POLICY IF EXISTS "Users can manage own video progress" ON public.video_progress;
DROP POLICY IF EXISTS "Admins can manage all video progress" ON public.video_progress;

CREATE POLICY "Users can read own video progress"
ON public.video_progress FOR SELECT
USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Users can manage own video progress"
ON public.video_progress FOR ALL
USING (user_id = auth.uid() OR public.is_admin())
WITH CHECK (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Admins can manage all video progress"
ON public.video_progress FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 3. Create the books table (used in Books.jsx)
CREATE TABLE IF NOT EXISTS public.books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  author text,
  description text,
  category text,
  price integer DEFAULT 0 CHECK (price >= 0),
  cover_image_url text,
  pdf_url text,
  razorpay_payment_link text,
  is_published boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS for books
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

-- Setup RLS Policies for books
DROP POLICY IF EXISTS "Published books are public" ON public.books;
DROP POLICY IF EXISTS "Admins can manage books" ON public.books;

CREATE POLICY "Published books are public"
ON public.books FOR SELECT
USING (is_published = true OR public.is_admin());

CREATE POLICY "Admins can manage books"
ON public.books FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 4. Create the contact_submissions table (used in Contact.jsx)
CREATE TABLE IF NOT EXISTS public.contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  phone text,
  message text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS for contact_submissions
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Setup RLS Policies for contact_submissions
DROP POLICY IF EXISTS "Anyone can submit contact forms" ON public.contact_submissions;
DROP POLICY IF EXISTS "Admins can manage contact submissions" ON public.contact_submissions;

CREATE POLICY "Anyone can submit contact forms"
ON public.contact_submissions FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can manage contact submissions"
ON public.contact_submissions FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 5. Create the newsletter_subscribers table (used in Contact.jsx)
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS for newsletter_subscribers
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Setup RLS Policies for newsletter_subscribers
DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Admins can manage newsletter subscribers" ON public.newsletter_subscribers;

CREATE POLICY "Anyone can subscribe to newsletter"
ON public.newsletter_subscribers FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can manage newsletter subscribers"
ON public.newsletter_subscribers FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 6. Create the live_sessions table (used in ManageLive.jsx)
CREATE TABLE IF NOT EXISTS public.live_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  scheduled_at timestamptz NOT NULL,
  stream_url text,
  thumbnail_url text,
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'ended')),
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS for live_sessions
ALTER TABLE public.live_sessions ENABLE ROW LEVEL SECURITY;

-- Setup RLS Policies for live_sessions
DROP POLICY IF EXISTS "Anyone can view live sessions" ON public.live_sessions;
DROP POLICY IF EXISTS "Admins can manage live sessions" ON public.live_sessions;

CREATE POLICY "Anyone can view live sessions"
ON public.live_sessions FOR SELECT
USING (true);

CREATE POLICY "Admins can manage live sessions"
ON public.live_sessions FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());
