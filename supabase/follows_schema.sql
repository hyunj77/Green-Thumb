-- 팔로우 (홈 화면 '추천 식집사' 팔로우 버튼용)
create table if not exists follows (
  id bigint generated always as identity primary key,
  follower_id uuid not null references profiles(id) on delete cascade,
  followee_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (follower_id, followee_id),
  check (follower_id <> followee_id)
);

alter table follows enable row level security;

create policy "follows are viewable by everyone" on follows for select using (true);
create policy "users can follow as themselves" on follows for insert with check (auth.uid() = follower_id);
create policy "users can unfollow their own follow" on follows for delete using (auth.uid() = follower_id);
