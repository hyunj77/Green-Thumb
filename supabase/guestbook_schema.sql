-- Green Thumb 방명록(Guestbook) 스키마
-- Supabase 대시보드 > SQL Editor 에 붙여넣고 Run 하세요.

-- 1. guestbook_entries: 식물 방명록 게시물
create table if not exists guestbook_entries (
  id bigint generated always as identity primary key,
  author_id uuid not null references profiles(id) on delete cascade,
  region text,
  message text not null check (char_length(message) <= 300),
  email text,
  sns_link text,
  mood_emoji text,
  best_plant_tag text,
  created_at timestamptz not null default now()
);

-- 2. guestbook_stamps: '초록 엄지' 응원 도장 (엔트리당 유저 1회)
create table if not exists guestbook_stamps (
  id bigint generated always as identity primary key,
  entry_id bigint not null references guestbook_entries(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (entry_id, user_id)
);

-- ==== Row Level Security ====
alter table guestbook_entries enable row level security;
alter table guestbook_stamps enable row level security;

create policy "guestbook entries are viewable by everyone" on guestbook_entries for select using (true);
create policy "users can insert own guestbook entry" on guestbook_entries for insert with check (auth.uid() = author_id);
create policy "users can delete own guestbook entry" on guestbook_entries for delete using (auth.uid() = author_id);

create policy "guestbook stamps are viewable by everyone" on guestbook_stamps for select using (true);
create policy "users can insert own stamp" on guestbook_stamps for insert with check (auth.uid() = user_id);
create policy "users can delete own stamp" on guestbook_stamps for delete using (auth.uid() = user_id);

-- email 컬럼은 매너 위반 신고/비밀 답변용 비공개 정보이므로
-- anon/authenticated 롤에서 SELECT 자체를 막아 클라이언트에서 절대 조회되지 않도록 한다.
-- (Storage/서버 없이도 컬럼 단위로 DB가 직접 강제하는 프라이버시 보호)
revoke select (email) on guestbook_entries from anon, authenticated;
