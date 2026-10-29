-- LightsNGo — run once in Supabase → SQL Editor (29 Oct 2026)
-- Photos and videos in feed posts.

-- 1) Posts can carry a video (image_url already exists).
alter table public.posts add column if not exists video_url text;

-- 2) Public storage bucket for post media (max 50 MB per file).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'post-media',
  'post-media',
  true,
  52428800,
  array['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/quicktime','video/webm']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- 3) Signed-in users can upload only into their own folder: post-media/<their user id>/...
drop policy if exists "Users upload own post media" on storage.objects;
create policy "Users upload own post media"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'post-media' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Users delete own post media" on storage.objects;
create policy "Users delete own post media"
  on storage.objects for delete to authenticated
  using (bucket_id = 'post-media' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Post media is public" on storage.objects;
create policy "Post media is public"
  on storage.objects for select
  using (bucket_id = 'post-media');
