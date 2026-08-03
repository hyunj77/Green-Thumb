-- 방명록(글쓰기) 대신, 프로필에서 바로 누르는 '초록 엄지 응원 도장' 기능.
-- 기존 guestbook_entries/guestbook_stamps는 글 작성 전제라 이 기능엔 맞지 않아 새 테이블을 둔다.
-- Supabase 대시보드 SQL Editor에서 실행하세요.

create table if not exists profile_stamps (
  id bigint generated always as identity primary key,
  target_user_id uuid not null references profiles(id) on delete cascade,
  visitor_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (target_user_id, visitor_id)
);

alter table profile_stamps enable row level security;

create policy "stamps are viewable by everyone" on profile_stamps for select using (true);
create policy "users can insert own stamp" on profile_stamps for insert with check (auth.uid() = visitor_id);
create policy "users can delete own stamp" on profile_stamps for delete using (auth.uid() = visitor_id);

create index if not exists profile_stamps_target_idx on profile_stamps (target_user_id);
