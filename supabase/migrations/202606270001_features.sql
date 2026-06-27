-- ─── Feature 1: Referral System ──────────────────────────────────────────────
create table if not exists public.referral_codes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  code text unique not null,
  created_at timestamptz default now()
);

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

create table if not exists public.referral_credits (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  credit_percent integer default 12,
  used boolean default false,
  source_referral_id uuid references public.referral_uses(id),
  created_at timestamptz default now()
);

alter table public.referral_codes enable row level security;
alter table public.referral_uses enable row level security;
alter table public.referral_credits enable row level security;

drop policy if exists "users read own referral codes" on public.referral_codes;
create policy "users read own referral codes" on public.referral_codes for select using (user_id = auth.uid());
drop policy if exists "users insert own referral code" on public.referral_codes;
create policy "users insert own referral code" on public.referral_codes for insert with check (user_id = auth.uid());

drop policy if exists "users read own referral uses" on public.referral_uses;
create policy "users read own referral uses" on public.referral_uses for select using (referrer_user_id = auth.uid() or referred_user_id = auth.uid());
drop policy if exists "users insert referral use" on public.referral_uses;
create policy "users insert referral use" on public.referral_uses for insert with check (referred_user_id = auth.uid());

drop policy if exists "users read own credits" on public.referral_credits;
create policy "users read own credits" on public.referral_credits for select using (user_id = auth.uid());

-- ─── Feature 2: Contact & Newsletter ─────────────────────────────────────────
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

create table if not exists public.newsletter_subscribers (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  created_at timestamptz default now()
);

alter table public.contact_submissions enable row level security;
alter table public.newsletter_subscribers enable row level security;

drop policy if exists "anyone can submit contact" on public.contact_submissions;
create policy "anyone can submit contact" on public.contact_submissions for insert with check (true);
drop policy if exists "anyone can subscribe newsletter" on public.newsletter_subscribers;
create policy "anyone can subscribe newsletter" on public.newsletter_subscribers for insert with check (true);

-- ─── Feature 4: Live Sessions ─────────────────────────────────────────────────
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

alter table public.live_sessions enable row level security;
drop policy if exists "live sessions are public" on public.live_sessions;
create policy "live sessions are public" on public.live_sessions for select using (true);
drop policy if exists "admins manage live sessions" on public.live_sessions;
create policy "admins manage live sessions" on public.live_sessions for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
) with check (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- ─── Feature 5: Video Progress ───────────────────────────────────────────────
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

alter table public.video_progress enable row level security;
drop policy if exists "users manage own video progress" on public.video_progress;
create policy "users manage own video progress" on public.video_progress for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ─── Feature 6: Books ────────────────────────────────────────────────────────
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

alter table public.books enable row level security;
drop policy if exists "published books are public" on public.books;
create policy "published books are public" on public.books for select using (is_published = true or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
drop policy if exists "admins manage books" on public.books;
create policy "admins manage books" on public.books for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
) with check (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
