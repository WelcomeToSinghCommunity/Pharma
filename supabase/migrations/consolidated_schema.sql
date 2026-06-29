-- Consolidated Idempotent Supabase Schema Setup
-- Paste this script directly into the Supabase SQL Editor and run it.

-- ============================================
-- 1. EXTENSIONS & FUNCTIONS
-- ============================================

create extension if not exists "pgcrypto";

-- Admin helper function
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

-- Trigger function for new user signups
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

-- ============================================
-- 2. TABLES CREATION
-- ============================================

-- Profiles table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  email text,
  avatar_url text,
  role text default 'learner' check (role in ('learner', 'admin')),
  created_at timestamptz default now()
);

-- Courses table
create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text,
  short_desc text,
  thumbnail_url text,
  instructor text default 'Harish Singh',
  level text check (level in ('Beginner', 'Intermediate', 'Advanced')),
  price_inr integer default 0 check (price_inr >= 0),
  what_you_will_learn jsonb default '[]'::jsonb,
  is_published boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Modules table
create table if not exists public.modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.courses(id) on delete cascade not null,
  title text not null,
  description text,
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- Lessons table
create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid references public.modules(id) on delete cascade not null,
  title text not null,
  content_text text,
  video_url text,
  video_duration integer,
  attachment_url text,
  is_preview boolean default false,
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- Enrollments table
create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  course_id uuid references public.courses(id) on delete cascade not null,
  enrolled_at timestamptz default now(),
  payment_id text,
  status text default 'active' check (status in ('active', 'expired', 'refunded')),
  unique (user_id, course_id)
);

-- Lesson progress table
create table if not exists public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  lesson_id uuid references public.lessons(id) on delete cascade not null,
  completed boolean default false,
  watch_seconds integer default 0,
  last_watched timestamptz,
  unique (user_id, lesson_id)
);

-- Subscription plans table
create table if not exists public.subscription_plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price_inr integer default 0 check (price_inr >= 0),
  interval text check (interval in ('monthly', 'quarterly', 'annual')),
  description text,
  features jsonb default '[]'::jsonb,
  is_active boolean default true,
  razorpay_plan_id text
);

-- User subscriptions table
create table if not exists public.user_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  plan_id uuid references public.subscription_plans(id) on delete restrict not null,
  razorpay_sub_id text,
  status text check (status in ('active', 'cancelled', 'past_due')),
  current_period_end timestamptz,
  created_at timestamptz default now()
);

-- Referral codes table
create table if not exists public.referral_codes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  code text unique not null,
  created_at timestamptz default now()
);

-- Referral uses table
create table if not exists public.referral_uses (
  id uuid default gen_random_uuid() primary key,
  referral_code text references public.referral_codes(code),
  referred_user_id uuid references auth.users(id),
  referrer_user_id uuid references auth.users(id),
  status text default 'pending' check (status in ('pending', 'converted')),
  discount_given boolean default false,
  order_id text,
  created_at timestamptz default now()
);

-- Referral credits table
create table if not exists public.referral_credits (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  credit_percent integer default 12,
  used boolean default false,
  source_referral_id uuid references public.referral_uses(id),
  created_at timestamptz default now()
);

-- Contact submissions table
create table if not exists public.contact_submissions (
  id uuid default gen_random_uuid() primary key,
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text,
  message text not null,
  read boolean default false,
  created_at timestamptz default now()
);

-- Newsletter subscribers table
create table if not exists public.newsletter_subscribers (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  created_at timestamptz default now()
);

-- Live sessions table
create table if not exists public.live_sessions (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  scheduled_at timestamptz not null,
  started_at timestamptz,
  ended_at timestamptz,
  status text default 'scheduled' check (status in ('scheduled', 'live', 'ended')),
  stream_url text,
  thumbnail_url text,
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);

-- Video progress table
create table if not exists public.video_progress (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  course_id uuid,
  video_id text not null,
  timestamp_seconds integer default 0,
  completed boolean default false,
  last_watched_at timestamptz default now(),
  unique(user_id, video_id)
);

-- Books table
create table if not exists public.books (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  author text,
  description text,
  cover_image_url text,
  price numeric,
  razorpay_payment_link text,
  pdf_url text,
  category text,
  is_published boolean default true,
  created_at timestamptz default now()
);

-- ============================================
-- 3. TRIGGERS
-- ============================================

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- ============================================
-- 4. ROW LEVEL SECURITY (RLS) & POLICIES
-- ============================================

alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.modules enable row level security;
alter table public.lessons enable row level security;
alter table public.enrollments enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.subscription_plans enable row level security;
alter table public.user_subscriptions enable row level security;
alter table public.referral_codes enable row level security;
alter table public.referral_uses enable row level security;
alter table public.referral_credits enable row level security;
alter table public.contact_submissions enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.live_sessions enable row level security;
alter table public.video_progress enable row level security;
alter table public.books enable row level security;

-- Drop all existing policies to avoid "already exists" conflicts on replay
drop policy if exists "profiles read own or admin" on public.profiles;
drop policy if exists "profiles update own or admin" on public.profiles;
drop policy if exists "admins manage profiles" on public.profiles;
drop policy if exists "profiles read own" on public.profiles;
drop policy if exists "profiles update own" on public.profiles;
drop policy if exists "profiles insert own" on public.profiles;
drop policy if exists "published courses are public" on public.courses;
drop policy if exists "admins manage courses" on public.courses;
drop policy if exists "published course modules are public" on public.modules;
drop policy if exists "admins manage modules" on public.modules;
drop policy if exists "lessons are gated by preview enrollment or admin" on public.lessons;
drop policy if exists "admins manage lessons" on public.lessons;
drop policy if exists "users read own enrollments" on public.enrollments;
drop policy if exists "users enroll in free courses" on public.enrollments;
drop policy if exists "admins manage enrollments" on public.enrollments;
drop policy if exists "users manage own lesson progress" on public.lesson_progress;
drop policy if exists "active plans are public" on public.subscription_plans;
drop policy if exists "admins manage subscription plans" on public.subscription_plans;
drop policy if exists "users read own subscriptions" on public.user_subscriptions;
drop policy if exists "admins manage user subscriptions" on public.user_subscriptions;
drop policy if exists "users read own referral codes" on public.referral_codes;
drop policy if exists "users insert own referral code" on public.referral_codes;
drop policy if exists "users read own referral uses" on public.referral_uses;
drop policy if exists "users insert referral use" on public.referral_uses;
drop policy if exists "users read own credits" on public.referral_credits;
drop policy if exists "anyone can submit contact" on public.contact_submissions;
drop policy if exists "anyone can subscribe newsletter" on public.newsletter_subscribers;
drop policy if exists "live sessions are public" on public.live_sessions;
drop policy if exists "admins manage live sessions" on public.live_sessions;
drop policy if exists "users manage own video progress" on public.video_progress;
drop policy if exists "published books are public" on public.books;
drop policy if exists "admins manage books" on public.books;

-- Recreate policies cleanly
create policy "profiles read own" on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "profiles update own" on public.profiles for update using (id = auth.uid() or public.is_admin()) with check (id = auth.uid() or public.is_admin());
create policy "profiles insert own" on public.profiles for insert with check (id = auth.uid());
create policy "admins manage profiles" on public.profiles for all using (public.is_admin()) with check (public.is_admin());

create policy "published courses are public" on public.courses for select using (is_published = true or public.is_admin());
create policy "admins manage courses" on public.courses for all using (public.is_admin()) with check (public.is_admin());

create policy "published course modules are public" on public.modules for select using (
  exists (
    select 1 from public.courses
    where courses.id = modules.course_id
      and (courses.is_published = true or public.is_admin())
  )
);
create policy "admins manage modules" on public.modules for all using (public.is_admin()) with check (public.is_admin());

create policy "lessons are gated by preview enrollment or admin" on public.lessons for select using (
  public.is_admin()
  or is_preview = true
  or exists (
    select 1
    from public.modules
    join public.courses on courses.id = modules.course_id
    join public.enrollments on enrollments.course_id = courses.id
    where modules.id = lessons.module_id
      and courses.is_published = true
      and enrollments.user_id = auth.uid()
      and enrollments.status = 'active'
  )
);
create policy "admins manage lessons" on public.lessons for all using (public.is_admin()) with check (public.is_admin());

create policy "users read own enrollments" on public.enrollments for select using (user_id = auth.uid() or public.is_admin());
create policy "users enroll in free courses" on public.enrollments for insert with check (
  user_id = auth.uid()
  and exists (
    select 1 from public.courses
    where courses.id = enrollments.course_id
      and courses.price_inr = 0
      and courses.is_published = true
  )
);
create policy "admins manage enrollments" on public.enrollments for all using (public.is_admin()) with check (public.is_admin());

create policy "users manage own lesson progress" on public.lesson_progress for all using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());

create policy "active plans are public" on public.subscription_plans for select using (is_active = true or public.is_admin());
create policy "admins manage subscription plans" on public.subscription_plans for all using (public.is_admin()) with check (public.is_admin());

create policy "users read own subscriptions" on public.user_subscriptions for select using (user_id = auth.uid() or public.is_admin());
create policy "admins manage user subscriptions" on public.user_subscriptions for all using (public.is_admin()) with check (public.is_admin());

create policy "users read own referral codes" on public.referral_codes for select using (user_id = auth.uid());
create policy "users insert own referral code" on public.referral_codes for insert with check (user_id = auth.uid());

create policy "users read own referral uses" on public.referral_uses for select using (referrer_user_id = auth.uid() or referred_user_id = auth.uid());
create policy "users insert referral use" on public.referral_uses for insert with check (referred_user_id = auth.uid());

create policy "users read own credits" on public.referral_credits for select using (user_id = auth.uid());

create policy "anyone can submit contact" on public.contact_submissions for insert with check (true);
create policy "anyone can subscribe newsletter" on public.newsletter_subscribers for insert with check (true);

create policy "live sessions are public" on public.live_sessions for select using (true);
create policy "admins manage live sessions" on public.live_sessions for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
) with check (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

create policy "users manage own video progress" on public.video_progress for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "published books are public" on public.books for select using (is_published = true or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
create policy "admins manage books" on public.books for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
) with check (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- ============================================
-- 5. VIEWS
-- ============================================

create or replace view public.lesson_catalog as
select
  lessons.id,
  lessons.module_id,
  lessons.title,
  lessons.video_duration,
  lessons.is_preview,
  lessons.sort_order,
  modules.course_id
from public.lessons
join public.modules on modules.id = lessons.module_id
join public.courses on courses.id = modules.course_id
where courses.is_published = true;

-- ============================================
-- 6. INITIAL DATA SEEDING (SAFE FOR RE-RUN)
-- ============================================

insert into public.courses (slug, title, description, short_desc, thumbnail_url, level, price_inr, what_you_will_learn, is_published)
values
  (
    'oos-investigation',
    'OOS Investigation',
    'Comprehensive guide to Out-of-Specification investigations as per USFDA, EU, and MHRA guidelines - from definition to CAPA.',
    'USFDA, EU, and MHRA-aligned investigation workflow from lab assessment to CAPA.',
    'https://images.unsplash.com/photo-1582719471384-894fbb16e074?auto=format&fit=crop&w=1200&q=80',
    'Intermediate',
    1499,
    '["Classify true OOS results versus laboratory error.", "Run structured root-cause analysis.", "Prepare inspection-ready documentation.", "Connect CAPA plans to prevention controls."]'::jsonb,
    true
  ),
  (
    'equipment-qualification',
    'Qualification of Instrument/Equipment',
    'Step-by-step guide to qualifying laboratory instruments and equipment per USP, EU GMP Annex 15, and GAMP 5 standards.',
    'Step-by-step DQ, IQ, OQ, PQ, and MQ for laboratory instruments and equipment.',
    'https://images.unsplash.com/photo-1581093588401-fbb62a02f120?auto=format&fit=crop&w=1200&q=80',
    'Beginner',
    999,
    '["Map qualification activities across the lifecycle.", "Build DQ/IQ/OQ/PQ/MQ documentation packs.", "Define acceptance criteria.", "Prepare equipment files for GMP inspection."]'::jsonb,
    true
  ),
  (
    'smoke-study-validation',
    'Smoke Study: Airflow Visualization',
    'Master airflow visualization studies in sterile pharmaceutical environments - from HVAC design to QA responsibilities and regulatory compliance.',
    'Sterile-area smoke studies, HVAC controls, visual recording, and QA oversight.',
    'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&w=1200&q=80',
    'Advanced',
    1999,
    '["Plan smoke studies for sterile areas.", "Assess airflow against Grade A expectations.", "Capture defensible video evidence.", "Document QA oversight and deviations."]'::jsonb,
    true
  ),
  (
    'csa-guidelines-fda-audits',
    'Implementation of CSA Guidelines & FDA Audits',
    'Practical guidance on implementing Computer Software Assurance guidelines and preparing for future FDA authority audits.',
    'Practical computer software assurance rollout for FDA inspection readiness.',
    'https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=1200&q=80',
    'Intermediate',
    0,
    '["Distinguish CSA from traditional CSV.", "Start CSA adoption from existing controls.", "Pilot low-risk activities.", "Prepare teams for FDA inspection expectations."]'::jsonb,
    true
  )
on conflict (slug) do nothing;

insert into public.subscription_plans (name, price_inr, interval, description, features, is_active)
values
  ('Free', 0, 'monthly', 'Free courses only', '["Course previews", "Free course access", "Profile dashboard"]'::jsonb, true),
  ('Pro Monthly', 499, 'monthly', 'All published courses', '["All course access", "Progress tracking", "Subscriber updates"]'::jsonb, true),
  ('Annual', 3999, 'annual', 'All courses plus early access', '["All course access", "Early access", "Priority updates"]'::jsonb, true)
on conflict do nothing;

-- Seeding course modules and lessons safely (without duplication on re-run)
do $$
declare
  course_record record;
  v_module_id uuid;
  v_module_index integer;
  v_lesson_index integer;
  v_module_payload jsonb;
  v_lesson_title text;
  course_outlines jsonb := jsonb_build_object(
    'oos-investigation', jsonb_build_array(
      jsonb_build_object('title', 'Introduction & Regulatory Framework', 'lessons', jsonb_build_array('Overview of OOS: Definition and Importance', 'Regulatory Agencies: USFDA, EMA, MHRA roles', 'Key Guidelines and GMP requirements', 'Compliance across jurisdictions')),
      jsonb_build_object('title', 'OOS Investigation Process', 'lessons', jsonb_build_array('Defining OOS results and acceptance criteria', 'Initial Assessment: Lab error vs. true OOS', 'Investigative Procedures and sample retesting', 'Root Cause Analysis (5 Whys, Fishbone)')),
      jsonb_build_object('title', 'Documentation & Reporting', 'lessons', jsonb_build_array('Importance of accurate documentation', 'Standard Operating Procedures (SOPs)', 'Data integrity and security', 'Audit trail maintenance', 'Regulatory reporting requirements')),
      jsonb_build_object('title', 'CAPA & Continuous Improvement', 'lessons', jsonb_build_array('Corrective and Preventive Actions (CAPA)', 'Implementing corrective measures', 'Enhancing training programs', 'Monitoring and evaluation metrics', 'Fostering a culture of continuous improvement'))
    ),
    'equipment-qualification', jsonb_build_array(
      jsonb_build_object('title', 'Design Qualification (DQ)', 'lessons', jsonb_build_array('Purpose and scope', 'User''s Responsibility: Intended use, Make/Model selection', 'Vendor qualification process', 'Manufacturer''s Responsibility: Documentation, Consultation', 'USP and EU GMP Annex 15 requirements')),
      jsonb_build_object('title', 'Installation Qualification (IQ)', 'lessons', jsonb_build_array('Pre-installation checklist', 'Comparing instrument with Purchase Order', 'Checking for damage, completeness of documents', 'Verifying environmental conditions', 'Installation procedure and documentation')),
      jsonb_build_object('title', 'Operation Qualification (OQ)', 'lessons', jsonb_build_array('Linking OQ to equipment location', 'Re-qualification on location change', 'Setting time intervals and acceptance criteria', 'Functional testing and use familiarization', 'Ensuring document completeness')),
      jsonb_build_object('title', 'Performance Qualification (PQ)', 'lessons', jsonb_build_array('Demonstrating consistent performance over lifecycle', 'SOP development for calibration', 'Periodic calibration procedures', 'Error detection, recording, and handling')),
      jsonb_build_object('title', 'Maintenance Qualification (MQ)', 'lessons', jsonb_build_array('Ongoing maintenance requirements', 'Selecting service providers', 'Defining maintenance schedules', 'Functional checks and cleaning frequency', 'Service contact agreements'))
    ),
    'smoke-study-validation', jsonb_build_array(
      jsonb_build_object('title', 'Introduction to Smoke Studies', 'lessons', jsonb_build_array('Definition: Airflow visualization in sterile environments', 'Regulatory basis and importance', 'Applications: Cleanrooms, isolators, LAF workstations')),
      jsonb_build_object('title', 'Engineering Design & Controls', 'lessons', jsonb_build_array('HVAC system design requirements (240-400 ACH for Grade A)', 'Pressure differentials between cleanroom grades (10-15 Pa)', 'HEPA filter positioning', 'Laminar Airflow (LAF) unit validation (0.45 m/s +/-20%)', 'Cleanroom layout and obstruction avoidance')),
      jsonb_build_object('title', 'Equipment & Setup', 'lessons', jsonb_build_array('Smoke generation: WFI-based foggers, sterile water vapor', 'Avoiding glycerin/oil-based smoke (residue risk)', 'Video recording: Camera placement, dark backgrounds, multi-angle', 'Monitoring: Anemometers, particle counters, pressure gauges')),
      jsonb_build_object('title', 'Manufacturing Personnel Roles', 'lessons', jsonb_build_array('Simulation of routine operations', 'Controlled movement protocols', 'Aseptic technique validation', 'Training and qualification requirements', 'Documentation of personnel behavior and deviations')),
      jsonb_build_object('title', 'QA Responsibilities', 'lessons', jsonb_build_array('Protocol review and approval', 'Oversight of execution', 'Risk assessment and corrective actions', 'Regulatory filing and documentation'))
    ),
    'csa-guidelines-fda-audits', jsonb_build_array(
      jsonb_build_object('title', 'Introduction to CSA', 'lessons', jsonb_build_array('Context of CSA vs. traditional CSV', 'Common implementation questions', 'Flexibility of FDA authority audits', 'Importance of understanding quality activity context')),
      jsonb_build_object('title', 'Implementation Strategy', 'lessons', jsonb_build_array('Assessing current activities and controls', 'Starting with existing processes for computer systems', 'Identifying necessary tools and resources', 'Piloting small projects before broader rollout', 'Gradual adaptation and practice refinement')),
      jsonb_build_object('title', 'FDA''s Internal Progress', 'lessons', jsonb_build_array('FDA''s adaptation of inspection models', 'Integration of CSA into FDA practices', 'Dissemination of information and internal training', 'Anticipated guidance releases', 'Feedback from FDA investigators')),
      jsonb_build_object('title', 'Collaboration & Support', 'lessons', jsonb_build_array('Seeking external expertise', 'Agency support mechanisms', 'Reviewing proposed changes', 'Ongoing dialogue and stakeholder engagement'))
    )
  );
begin
  for course_record in
    select id, slug from public.courses where slug in (
      'oos-investigation',
      'equipment-qualification',
      'smoke-study-validation',
      'csa-guidelines-fda-audits'
    )
  loop
    v_module_index := 0;
    for v_module_payload in select * from jsonb_array_elements(course_outlines -> course_record.slug)
    loop
      -- Check if module already exists to prevent duplication
      select id into v_module_id 
      from public.modules 
      where course_id = course_record.id and title = (v_module_payload ->> 'title');

      if v_module_id is null then
        insert into public.modules (course_id, title, sort_order)
        values (course_record.id, v_module_payload ->> 'title', v_module_index)
        returning id into v_module_id;
      end if;

      v_lesson_index := 0;
      for v_lesson_title in select jsonb_array_elements_text(v_module_payload -> 'lessons')
      loop
        -- Check if lesson already exists to prevent duplication
        if not exists (select 1 from public.lessons where module_id = v_module_id and title = v_lesson_title) then
          insert into public.lessons (
            module_id,
            title,
            content_text,
            video_duration,
            is_preview,
            sort_order
          )
          values (
            v_module_id,
            v_lesson_title,
            'Launch seed lesson notes. Replace with full markdown content in the admin panel.',
            480 + (v_lesson_index * 120),
            v_module_index = 0 and v_lesson_index = 0,
            v_lesson_index
          );
        end if;
        v_lesson_index := v_lesson_index + 1;
      end loop;

      v_module_index := v_module_index + 1;
    end loop;
  end loop;
end;
$$;
