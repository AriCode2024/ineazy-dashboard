# User Dashboard

A separate Next.js app for the logged-in user area (login, orders, profile, status). Lives on its own subdomain (e.g. `app.yoursite.com`) and is linked to from the marketing Webflow site.

## Stack

- **Next.js 15** (App Router, TypeScript, Tailwind v4)
- **Supabase** — Postgres database + auth (free tier covers you while starting)
- **Vercel** — hosting (free)

## First-time setup

Do these steps once, in order.

### 1. Create a Supabase project

1. Go to <https://supabase.com>, sign up, click **New project**.
2. Pick any name and a strong DB password (save it). Region: closest to your users.
3. Wait ~1 min for it to provision.

### 2. Run the schema

1. In Supabase, open **SQL Editor** (left sidebar) → **New query**.
2. Open `supabase/schema.sql` from this repo, copy the whole file, paste it in.
3. Click **Run**. You should see "Success. No rows returned."

This creates the `profiles` and `orders` tables and the row-level security rules so each user only sees their own data.

### 3. Wire up env vars

1. In Supabase, go to **Project settings → API**.
2. Copy **Project URL** and **anon public** key.
3. In this repo, copy `.env.local.example` to `.env.local` and paste the two values in.

### 4. (Dev only) Disable email confirmation

So you can sign up and immediately log in without checking email:

- Supabase → **Authentication → Providers → Email** → turn **off** "Confirm email" → save.

Re-enable this before you go to production.

### 5. Run it

```bash
npm install --legacy-peer-deps
npm run dev
```

Open <http://localhost:3000>. You'll be redirected to `/login`. Click **Sign up**, create an account, log in.

The dashboard will be empty (no orders yet). To see data, follow the "seed a fake order" block at the bottom of `supabase/schema.sql`.

## Linking from Webflow

Once deployed (e.g. to Vercel at `app.yoursite.com`), in your Webflow site:

1. Add a **Login** / **My Account** button in the nav.
2. Set its URL to `https://app.yoursite.com/login` (or just `https://app.yoursite.com` — it auto-redirects).

That's it. Users click it from Webflow, land in the Next.js app, log in, and see their dashboard.

## What you might want to change

The defaults are guesses since we didn't pin down requirements:

- **Order fields** (`supabase/schema.sql`): currently `order_number`, `status`, `items` (JSON), `total`, `tracking_url`, `notes`. Add/remove columns to fit your actual product.
- **Status values**: `pending / processing / shipped / completed / cancelled`. Edit the `check` constraint in the schema if you sell services or subscriptions instead of physical goods.
- **Profile fields**: `full_name`, `phone`, `address`. Add whatever else you want (company, tax ID, etc.).
- **Branding**: colors are basic black/gray. Edit Tailwind classes in `app/(dashboard)/layout.tsx` and the pages to match your Webflow theme.

## Project structure

```
app/
├── login/                  ← log in form
├── signup/                 ← create account
├── (dashboard)/            ← everything below requires login
│   ├── layout.tsx          ← sidebar nav + sign out
│   ├── dashboard/          ← overview + recent orders
│   ├── orders/             ← full orders list
│   └── profile/            ← edit profile
├── layout.tsx              ← root html
└── page.tsx                ← redirects to /login or /dashboard

lib/supabase/               ← Supabase client setup (3 flavors)
middleware.ts               ← redirects unauthed users to /login
components/status-badge.tsx ← shared UI bit
supabase/schema.sql         ← run this in Supabase once
```

## Deploying

1. Push this folder to a GitHub repo.
2. Import it on <https://vercel.com> → New Project.
3. Add the same two env vars (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) under **Settings → Environment Variables**.
4. Deploy. Add your custom domain (e.g. `app.yoursite.com`) under **Settings → Domains**.
