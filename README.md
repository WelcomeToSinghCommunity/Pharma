# HarishPharmaAcademy

Pharmaceutical training and certification platform for Harish Singh, built from the June 2026 PRD.

## What is included

- React + Vite + TailwindCSS frontend
- Public landing page, course catalog, course detail pages, pricing page
- Learner dashboard, enrolled courses, profile, and course player shell
- Owner/admin dashboard, course table, course builder shell, user management
- Four seeded launch courses from the PRD
- Supabase migration with schema, RLS policies, signup profile trigger, subscription plans, and seeded modules/lessons
- Supabase Edge Function placeholders for Razorpay order creation and webhook enrollment
- Custom HarishPharmaAcademy SVG logo in `public/logo-harish-pharma-academy.svg`

## Run locally

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:5173/`.

## Build

```bash
npm run build
```

## Environment

Copy `.env.example` to `.env.local` and fill the required Supabase, Razorpay, Cloudflare, Resend, and app values.

## Supabase

Apply the SQL in:

```text
supabase/migrations/202606250001_initial_schema.sql
```

Then deploy the Edge Functions:

```bash
supabase functions deploy create-order
supabase functions deploy razorpay-webhook
```

## Next implementation steps

- Replace mock frontend state with Supabase queries and auth session state
- Connect admin forms to Supabase CRUD and R2/Stream uploads
- Wire Razorpay checkout UI to `create-order`
- Add Cloudflare Stream or Mux player integration
- Add Resend transactional emails
