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
-- POST LIKES
-- One row per (post, user). Deleting the row = unliking.
-- ------------------------------------------------------------
create table public.post_likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (post_id, user_id)
);

alter table public.post_likes enable row level security;

create policy "Likes are viewable by everyone"
  on public.post_likes for select
  using (true);

create policy "Authenticated users can like a post"
  on public.post_likes for insert
  with check (auth.uid() = user_id);

create policy "Users can remove their own like"
  on public.post_likes for delete
  using (auth.uid() = user_id);

-- ------------------------------------------------------------
-- POST COMMENTS
-- ------------------------------------------------------------
create table public.post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

alter table public.post_comments enable row level security;

create policy "Comments are viewable by everyone"
  on public.post_comments for select
  using (true);

create policy "Authenticated users can comment"
  on public.post_comments for insert
  with check (auth.uid() = author_id);

create policy "Users can delete their own comments"
  on public.post_comments for delete
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
  using (auth.uid() = recipient_id)
  with check (auth.uid() = recipient_id and status = 'accepted');

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

create policy "Users can send a DM only to an accepted contact"
  on public.direct_messages for insert
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.contacts c
      where c.status = 'accepted'
        and (
          (c.requester_id = sender_id and c.recipient_id = recipient_id)
          or (c.requester_id = recipient_id and c.recipient_id = sender_id)
        )
    )
  );

-- ------------------------------------------------------------
-- CONTENT MODERATION
-- A simple, admin-managed word blocklist. Add or remove words
-- any time from Supabase Studio → Table Editor → banned_words
-- (no code change or redeploy needed). RLS is enabled with NO
-- policies, so the table is invisible to the app/anon users —
-- only you, via the Supabase dashboard, can see or edit it.
-- Matching is case-insensitive and catches the word anywhere
-- inside the text (so it also catches it inside other words —
-- keep entries specific enough to avoid false positives).
-- ------------------------------------------------------------
create table public.banned_words (
  word text primary key,
  created_at timestamptz not null default now()
);

alter table public.banned_words enable row level security;
-- Intentionally no policies: nobody can read/write this table
-- through the app's API. Manage it from Supabase Studio only.

-- A couple of mild starter examples so you can see how it
-- behaves — replace these with real entries for your community.
insert into public.banned_words (word) values ('idiot'), ('stupid');

create or replace function public.contains_banned_word(input text)
returns boolean as $$
declare
  banned record;
begin
  if input is null then
    return false;
  end if;
  for banned in select word from public.banned_words loop
    if input ilike '%' || banned.word || '%' then
      return true;
    end if;
  end loop;
  return false;
end;
$$ language plpgsql security definer stable;

create or replace function public.moderate_single_column()
returns trigger as $$
begin
  if public.contains_banned_word(new.content) then
    raise exception 'Your message contains language that is not allowed here.'
      using errcode = 'P0001';
  end if;
  return new;
end;
$$ language plpgsql security definer;

create or replace function public.moderate_guide_entry()
returns trigger as $$
begin
  if public.contains_banned_word(new.title) or public.contains_banned_word(new.content) then
    raise exception 'Your message contains language that is not allowed here.'
      using errcode = 'P0001';
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger moderate_posts
  before insert or update on public.posts
  for each row execute procedure public.moderate_single_column();

create trigger moderate_comments
  before insert or update on public.post_comments
  for each row execute procedure public.moderate_single_column();

create trigger moderate_chat_messages
  before insert or update on public.chat_messages
  for each row execute procedure public.moderate_single_column();

create trigger moderate_direct_messages
  before insert or update on public.direct_messages
  for each row execute procedure public.moderate_single_column();

create trigger moderate_guide_entries
  before insert or update on public.guide_entries
  for each row execute procedure public.moderate_guide_entry();

-- ------------------------------------------------------------
-- RATE LIMITING
-- Stops a single account from flooding the feed/chat/DMs. Limits
-- are generous for normal use, tight enough to stop a script.
-- Adjust the numbers below any time by editing and re-running
-- just these function definitions (create or replace is safe to
-- re-run).
-- ------------------------------------------------------------
create or replace function public.rate_limit_posts()
returns trigger as $$
begin
  if (select count(*) from public.posts
      where author_id = new.author_id
        and created_at > now() - interval '10 minutes') >= 10 then
    raise exception 'You are posting too fast — please slow down.'
      using errcode = 'P0001';
  end if;
  return new;
end;
$$ language plpgsql security definer;

create or replace function public.rate_limit_comments()
returns trigger as $$
begin
  if (select count(*) from public.post_comments
      where author_id = new.author_id
        and created_at > now() - interval '5 minutes') >= 20 then
    raise exception 'You are commenting too fast — please slow down.'
      using errcode = 'P0001';
  end if;
  return new;
end;
$$ language plpgsql security definer;

create or replace function public.rate_limit_chat()
returns trigger as $$
begin
  if (select count(*) from public.chat_messages
      where author_id = new.author_id
        and created_at > now() - interval '1 minute') >= 30 then
    raise exception 'You are sending messages too fast — please slow down.'
      using errcode = 'P0001';
  end if;
  return new;
end;
$$ language plpgsql security definer;

create or replace function public.rate_limit_dms()
returns trigger as $$
begin
  if (select count(*) from public.direct_messages
      where sender_id = new.sender_id
        and created_at > now() - interval '1 minute') >= 30 then
    raise exception 'You are sending messages too fast — please slow down.'
      using errcode = 'P0001';
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger rate_limit_posts_trigger
  before insert on public.posts
  for each row execute procedure public.rate_limit_posts();

create trigger rate_limit_comments_trigger
  before insert on public.post_comments
  for each row execute procedure public.rate_limit_comments();

create trigger rate_limit_chat_trigger
  before insert on public.chat_messages
  for each row execute procedure public.rate_limit_chat();

create trigger rate_limit_dms_trigger
  before insert on public.direct_messages
  for each row execute procedure public.rate_limit_dms();

-- ------------------------------------------------------------
-- Realtime: broadcast changes for chat + DMs
-- ------------------------------------------------------------
alter publication supabase_realtime add table public.chat_messages;
alter publication supabase_realtime add table public.direct_messages;

-- ------------------------------------------------------------
-- Seed the full official 2027 F1 calendar (24 rounds), announced
-- September 16, 2026. race_date is the Sunday/final day of each
-- race weekend.
-- ------------------------------------------------------------
insert into public.race_events (slug, name, city, country, circuit_name, season_year, race_date)
values
  ('bahrain-2027', 'Bahrain Grand Prix', 'Sakhir', 'Bahrain', 'Bahrain International Circuit', 2027, '2027-03-14'),
  ('saudi-arabia-2027', 'Saudi Arabian Grand Prix', 'Jeddah', 'Saudi Arabia', 'Jeddah Corniche Circuit', 2027, '2027-03-21'),
  ('australia-2027', 'Australian Grand Prix', 'Melbourne', 'Australia', 'Albert Park Circuit', 2027, '2027-04-04'),
  ('japan-2027', 'Japanese Grand Prix', 'Suzuka', 'Japan', 'Suzuka Circuit', 2027, '2027-04-11'),
  ('china-2027', 'Chinese Grand Prix', 'Shanghai', 'China', 'Shanghai International Circuit', 2027, '2027-04-18'),
  ('miami-2027', 'Miami Grand Prix', 'Miami', 'United States', 'Miami International Autodrome', 2027, '2027-05-02'),
  ('canada-2027', 'Canadian Grand Prix', 'Montreal', 'Canada', 'Circuit Gilles Villeneuve', 2027, '2027-05-23'),
  ('monaco-2027', 'Monaco Grand Prix', 'Monte Carlo', 'Monaco', 'Circuit de Monaco', 2027, '2027-06-06'),
  ('portugal-2027', 'Portuguese Grand Prix', 'Portimão', 'Portugal', 'Autódromo do Algarve', 2027, '2027-06-20'),
  ('britain-2027', 'British Grand Prix', 'Silverstone', 'United Kingdom', 'Silverstone Circuit', 2027, '2027-07-04'),
  ('austria-2027', 'Austrian Grand Prix', 'Spielberg', 'Austria', 'Red Bull Ring', 2027, '2027-07-11'),
  ('belgium-2027', 'Belgian Grand Prix', 'Spa-Francorchamps', 'Belgium', 'Circuit de Spa-Francorchamps', 2027, '2027-07-25'),
  ('hungary-2027', 'Hungarian Grand Prix', 'Budapest', 'Hungary', 'Hungaroring', 2027, '2027-08-01'),
  ('italy-2027', 'Italian Grand Prix', 'Monza', 'Italy', 'Autodromo Nazionale Monza', 2027, '2027-09-05'),
  ('spain-2027', 'Spanish Grand Prix', 'Madrid', 'Spain', 'Madring', 2027, '2027-09-12'),
  ('azerbaijan-2027', 'Azerbaijan Grand Prix', 'Baku', 'Azerbaijan', 'Baku City Circuit', 2027, '2027-09-26'),
  ('turkey-2027', 'Turkish Grand Prix', 'Istanbul', 'Turkey', 'Istanbul Park', 2027, '2027-10-03'),
  ('singapore-2027', 'Singapore Grand Prix', 'Singapore', 'Singapore', 'Marina Bay Street Circuit', 2027, '2027-10-10'),
  ('usa-2027', 'United States Grand Prix', 'Austin', 'United States', 'Circuit of the Americas', 2027, '2027-10-24'),
  ('mexico-2027', 'Mexican Grand Prix', 'Mexico City', 'Mexico', 'Autódromo Hermanos Rodríguez', 2027, '2027-10-31'),
  ('brazil-2027', 'Brazilian Grand Prix', 'São Paulo', 'Brazil', 'Interlagos', 2027, '2027-11-07'),
  ('las-vegas-2027', 'Las Vegas Grand Prix', 'Las Vegas', 'United States', 'Las Vegas Strip Circuit', 2027, '2027-11-20'),
  ('qatar-2027', 'Qatar Grand Prix', 'Lusail', 'Qatar', 'Losail International Circuit', 2027, '2027-12-05'),
  ('abu-dhabi-2027', 'Abu Dhabi Grand Prix', 'Abu Dhabi', 'United Arab Emirates', 'Yas Marina Circuit', 2027, '2027-12-12');
