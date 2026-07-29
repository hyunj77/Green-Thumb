-- 게시글/식물/장터/성장일기 사진(갤러리 업로드)을 위한 공용 Storage 버킷 + 정책.
-- 경로 구조: {userId}/{posts|plants|listings|growth}/{timestamp}.{ext}
-- Supabase 대시보드 SQL Editor에서 실행하세요.

insert into storage.buckets (id, name, public)
values ('uploads', 'uploads', true)
on conflict (id) do nothing;

create policy "upload images are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'uploads');

create policy "users can upload into their own uploads folder"
  on storage.objects for insert
  with check (bucket_id = 'uploads' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "users can update their own uploads"
  on storage.objects for update
  using (bucket_id = 'uploads' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "users can delete their own uploads"
  on storage.objects for delete
  using (bucket_id = 'uploads' and (storage.foldername(name))[1] = auth.uid()::text);
