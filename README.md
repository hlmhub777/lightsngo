# LightsNGo — F1 fan community platform

This is a working starting point for your app: user profiles, a feed, a chat
room and city guide per race weekend, and a contact list with private
messaging (Yahoo Messenger–style). The brand mark is the five-light F1 start
sequence — it lights up in the navbar and on the homepage, and doubles as a
ready-made loading animation anywhere else you need one. No coding
experience needed to get it live — you're mostly clicking buttons on two
websites: **Supabase** (your database + logins) and **Vercel** (hosting).

Budget about 30–45 minutes for first setup.

---

## 1. Create your database (Supabase)

1. Go to [supabase.com](https://supabase.com) and sign up (free tier is fine
   to start).
2. Click **New project**. Pick any name (e.g. "paddock"), set a database
   password (save it somewhere), pick a region close to your users, click
   **Create new project**. Wait ~2 minutes while it provisions.
3. In the left sidebar, click **SQL Editor** → **New query**.
4. Open the file `supabase/schema.sql` from this project, copy the whole
   thing, paste it into the SQL editor, and click **Run**. This creates all
   your tables (profiles, race events, posts, chat, contacts, DMs) and adds
   three sample races (Monza, Monaco, Spa) so the app isn't empty.
5. In the left sidebar, go to **Project Settings** (gear icon) → **API**.
   You'll need two values from this page in step 3 below:
   - **Project URL**
   - **anon public** key

That's your entire backend — real accounts, a real database, real-time chat.

> **Already ran the schema before?** If you set up Supabase earlier and are
> just updating, run this small migration instead of the full schema again
> (SQL Editor → New query):
>
> ```sql
> alter table public.profiles
>   add column if not exists age_confirmed_18 boolean not null default false,
>   add column if not exists terms_accepted_at timestamptz;
> ```
>
> Then re-run just the `create or replace function public.handle_new_user()`
> block from `schema.sql` (the trigger itself doesn't need to change).

---

## 2. Put the code on GitHub

1. Go to [github.com](https://github.com), sign up if you don't have an
   account.
2. Click the **+** in the top right → **New repository**. Name it (e.g.
   `lightsngo`), keep it Private if you prefer, click **Create
   repository**.
3. On the new repo's page, click **uploading an existing file** and drag in
   this entire project folder (everything except the `node_modules` folder,
   if present — you won't have one from this download). GitHub will ask you
   to commit — just click **Commit changes**.

---

## 3. Deploy it (Vercel)

1. Go to [vercel.com](https://vercel.com) and sign up using your GitHub
   account — this lets Vercel see your repos.
2. Click **Add New** → **Project**, find the `lightsngo` repo you just
   created, click **Import**.
3. Before clicking Deploy, expand **Environment Variables** and add two:
   - `NEXT_PUBLIC_SUPABASE_URL` → paste your Supabase **Project URL**
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → paste your Supabase **anon public**
     key
4. Click **Deploy**. Wait a minute or two.
5. You'll get a live link like `lightsngo.vercel.app` — that's your app,
   live on the internet, for anyone to sign up and use.

---

## What's already built

- **Sign up / log in** — real accounts via Supabase Auth (email + password).
- **Profile** — username, country, gender, birth year, favorite team,
  favorite driver, tracks visited, bio.
- **Feed** — public posts, newest first.
- **Race weekends** — a page per Grand Prix (starts with Monza, Monaco, Spa
  for 2027 as samples).
  - Each race has a **city guide**: transport, hotel, food, and nightlife
    tips, added by fans, tied to that specific race weekend.
  - Each race has a **live chat room** (real-time — messages appear
    instantly for everyone in it).
- **Messages** — search for a fan by username, send a contact request; once
  accepted, you get a private 1-on-1 chat, styled like an old-school
  messenger (contact list, chat bubbles, online indicator).
- **Terms and Conditions + Privacy Policy** — real pages at `/terms` and
  `/privacy`, linked in the footer on every page and required at signup (a
  checkbox confirming the user is 18+ and agrees to both — nobody can create
  an account without checking it).

### Before you launch: fill in the placeholders

Both legal pages (`app/terms/page.tsx` and `app/privacy/page.tsx`) are
solid drafts, but they have `[BRACKETED PLACEHOLDERS]` you need to replace:
your legal name or company name, contact email, country/jurisdiction, and
the Supabase region you picked. **Have an actual lawyer review both before
you open signups to the public** — this gets you most of the way there, but
GDPR fines are serious enough that a real review is worth it, especially
since the app collects country, gender, and message content.

## What isn't built yet (intentionally left for v1.1+)

- Profile photo upload (currently just initials — Supabase Storage handles
  this cleanly when you're ready, ask me and I'll add it).
- Race calendar/reminders, predictions/polls.
- Moderation tools (report/block) — worth prioritizing given the platform is
  open to all ages; ask me when you're ready to add this.
- Payments/monetization.

## Security hardening — a few things to finish in the Supabase dashboard

Some of this couldn't be done in code — it's toggles in your Supabase
project:

1. **Confirm email on signup.** Supabase → Authentication → Sign In / Up →
   make sure "Confirm email" is turned on. Without it, anyone can create
   an account with a fake, unverified email address.
2. **Password minimum length.** Supabase → Authentication → Sign In / Up →
   set minimum password length to 8 (matches the signup form, which
   already requires 8).
3. **CAPTCHA on signup and login** (optional but recommended once you
   start promoting the app publicly):
   - Create a free account at [hcaptcha.com](https://hcaptcha.com), add a
     new site, and copy the **Site Key** and **Secret Key** it gives you.
   - In Supabase → Authentication → Attack Protection → enable "Enable
     Captcha protection", choose hCaptcha, and paste in the **Secret
     Key**.
   - In Vercel → your project → Settings → Environment Variables, add
     `NEXT_PUBLIC_HCAPTCHA_SITE_KEY` with the **Site Key** value, then
     redeploy.
   - Until you set this up, signup and login work exactly as before —
     the CAPTCHA step only appears once the site key is present.

## Making changes later

Every screen is a separate file under `app/`. You don't need to know how to
code to ask me to change something — just describe what you want
differently ("make the Send button green", "add a photo field to
signup") and paste me the relevant file if you're working outside this
chat, or just tell me here and I'll edit it directly.
