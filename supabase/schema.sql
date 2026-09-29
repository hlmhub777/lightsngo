-- ============================================================
-- Paddock — F1 fan community platform
-- Run this whole file once in Supabase: Dashboard → SQL Editor → New query → paste → Run
-- ============================================================

-- Lets Postgres generate UUIDs for us
create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- PROFILES
-- One row per user, created automatically when someone signs up.
-- ------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  avatar_url text,
  country text,
  gender text,
  birth_year int,
  favorite_team text,
  favorite_driver text,
  tracks_visited text[] default '{}',
  bio text,
  age_confirmed_18 boolean not null default false,
  terms_accepted_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Auto-create a profile row whenever someone signs up via Supabase Auth
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, age_confirmed_18, terms_accepted_at)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1)),
    coalesce((new.raw_user_meta_data ->> 'age_confirmed_18')::boolean, false),
    case
      when (new.raw_user_meta_data ->> 'terms_accepted')::boolean is true then now()
      else null
    end
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ------------------------------------------------------------
-- RACE EVENTS
-- One row per Grand Prix weekend (e.g. "Monza GP 2027").
-- This is the anchor for the feed, chat room, and city guide.
-- ------------------------------------------------------------
create table public.race_events (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  city text not null,
  country text not null,
  circuit_name text,
  season_year int not null,
  race_date date,
  cover_image_url text,
  created_at timestamptz not null default now()
);

alter table public.race_events enable row level security;

create policy "Race events are viewable by everyone"
  on public.race_events for select
  using (true);

-- ------------------------------------------------------------
-- POSTS (public feed)
-- Optionally tagged to a race event.
-- ------------------------------------------------------------
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  race_event_id uuid references public.race_events(id) on delete set null,
  content text not null,
  image_url text,
  created_at timestamptz not null default now()
);

alter table public.posts enable row level security;

create policy "Posts are viewable by everyone"
  on public.posts for select
  using (true);

create policy "Authenticated users can create posts"
  on public.posts for insert
  with check (auth.uid() = author_id);

create policy "Users can delete their own posts"
  on public.posts for delete
  using (auth.uid() = author_id);

-- ------------------------------------------------------------
-- CITY GUIDE ENTRIES
-- Crowd-sourced tips per race event: transport / hotel / food / nightlife.
-- ------------------------------------------------------------
create table public.guide_entries (
  id uuid primary key default gen_random_uuid(),
  race_event_id uuid not null references public.race_events(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  category text not null check (category in ('transport', 'hotel', 'food', 'nightlife')),
  title text not null,
  content text not null,
  upvotes int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.guide_entries enable row level security;

create policy "Guide entries are viewable by everyone"
  on public.guide_entries for select
  using (true);

create policy "Authenticated users can add guide entries"
  on public.guide_entries for insert
  with check (auth.uid() = author_id);

-- ------------------------------------------------------------
-- CHAT MESSAGES (public room, one per race event)
-- ------------------------------------------------------------
create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  race_event_id uuid not null references public.race_events(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

alter table public.chat_messages enable row level security;

create policy "Chat messages are viewable by everyone signed in"
  on public.chat_messages for select
  using (auth.role() = 'authenticated');

create policy "Authenticated users can send chat messages"
  on public.chat_messages for insert
  with check (auth.uid() = author_id);

-- ------------------------------------------------------------
-- CONTACTS (friend requests, Messenger-style)
-- A row is created by the requester with status 'pending';
-- the recipient updates it to 'accepted' to unlock DMs.
-- ------------------------------------------------------------
create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles(id) on delete cascade,
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted')),
  created_at timestamptz not null default now(),
  unique (requester_id, recipient_id)
);

alter table public.contacts enable row level security;

create policy "Users can view contact rows they're part of"
  on public.contacts for select
  using (auth.uid() = requester_id or auth.uid() = recipient_id);

create policy "Users can send contact requests"
  on public.contacts for insert
  with check (auth.uid() = requester_id);

create policy "Recipient can accept a contact request"
  on public.contacts for update
  using (auth.uid() = recipient_id);

-- ------------------------------------------------------------
-- DIRECT MESSAGES
-- Only readable/writable by the two people in the conversation.
-- ------------------------------------------------------------
create table public.direct_messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles(id) on delete cascade,
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

alter table public.direct_messages enable row level security;

create policy "Users can view their own conversations"
  on public.direct_messages for select
  using (auth.uid() = sender_id or auth.uid() = recipient_id);

create policy "Users can send a DM"
  on public.direct_messages for insert
  with check (auth.uid() = sender_id);

-- ------------------------------------------------------------
-- Realtime: broadcast changes for chat + DMs
-- ------------------------------------------------------------
alter publication supabase_realtime add table public.chat_messages;
alter publication supabase_realtime add table public.direct_messages;

-- ------------------------------------------------------------
-- Seed a couple of race events so the app isn't empty on first run
-- ------------------------------------------------------------
insert into public.race_events (slug, name, city, country, circuit_name, season_year, race_date)
values
  ('monza-2027', 'Italian Grand Prix', 'Monza', 'Italy', 'Autodromo Nazionale Monza', 2027, '2027-09-05'),
  ('monaco-2027', 'Monaco Grand Prix', 'Monte Carlo', 'Monaco', 'Circuit de Monaco', 2027, '2027-05-23'),
  ('spa-2027', 'Belgian Grand Prix', 'Spa-Francorchamps', 'Belgium', 'Circuit de Spa-Francorchamps', 2027, '2027-07-25');
