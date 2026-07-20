-- Green Thumb 게시물 북마크(저장) 스키마
create table if not exists post_bookmarks (
  id bigint generated always as identity primary key,
  post_id bigint not null references posts(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (post_id, user_id)
);

alter table post_bookmarks enable row level security;

create policy "users can view own bookmarks" on post_bookmarks for select using (auth.uid() = user_id);
create policy "users can insert own bookmarks" on post_bookmarks for insert with check (auth.uid() = user_id);
create policy "users can delete own bookmarks" on post_bookmarks for delete using (auth.uid() = user_id);
