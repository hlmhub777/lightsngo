-- LightsNGo — CLEAR THE FEED (run yourself in Supabase → SQL Editor).
-- This permanently deletes posts. Likes and comments on them are removed too.
-- Step 1: look at what's there first.
select p.id, pr.username, left(p.content, 80) as text, p.created_at
from public.posts p left join public.profiles pr on pr.id = p.author_id
order by p.created_at desc;

-- Step 2: delete ALL current posts (uncomment the next line to run it).
-- delete from public.posts;

-- Or delete only the posts of specific test accounts, e.g.:
-- delete from public.posts where author_id in (select id from public.profiles where username in ('test1','test2'));
