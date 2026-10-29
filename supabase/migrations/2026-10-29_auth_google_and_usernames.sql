-- LightsNGo — run once in Supabase → SQL Editor (29 Oct 2026)
-- 1) New-user trigger: saves birth_year from the signup form, and never fails
--    when the username is already taken (adds a short number instead).
--    Google sign-ups get a username from their email, then pick their own on
--    the /complete-profile step.
create or replace function public.handle_new_user()
returns trigger as $$
declare
  base_name text;
  final_name text;
  tries int := 0;
begin
  base_name := lower(regexp_replace(
    coalesce(
      new.raw_user_meta_data ->> 'username',
      split_part(new.email, '@', 1),
      'fan'
    ),
    '[^a-zA-Z0-9_.]', '', 'g'
  ));
  if length(base_name) < 3 then
    base_name := 'fan_' || base_name;
  end if;
  base_name := left(base_name, 24);
  final_name := base_name;

  while exists (select 1 from public.profiles where username = final_name) loop
    tries := tries + 1;
    final_name := base_name || '_' || (floor(random() * 9000) + 1000)::int;
    exit when tries > 20;
  end loop;

  insert into public.profiles (id, username, birth_year, age_confirmed_18, terms_accepted_at)
  values (
    new.id,
    final_name,
    nullif(new.raw_user_meta_data ->> 'birth_year', '')::int,
    coalesce((new.raw_user_meta_data ->> 'age_confirmed_18')::boolean, false),
    case
      when (new.raw_user_meta_data ->> 'terms_accepted')::boolean is true then now()
      else null
    end
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- 2) Backfill birth_year for existing email members who chose it at signup.
update public.profiles p
set birth_year = nullif(u.raw_user_meta_data ->> 'birth_year', '')::int
from auth.users u
where u.id = p.id
  and p.birth_year is null
  and (u.raw_user_meta_data ->> 'birth_year') is not null;
