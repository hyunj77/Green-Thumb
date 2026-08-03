-- 그린이 방문하기: 방문자가 다른 유저의 그린이에게 물을 주거나 쓰다듬을 수 있게 한다.
-- 방문자당 하루 1번씩만 카운트되도록 오늘 날짜 기준으로 기록한다 (어뷰징 방지).
-- Supabase 대시보드 SQL Editor에서 실행하세요.

create table if not exists greenie_visits (
  visitor_id uuid not null references profiles(id) on delete cascade,
  target_user_id uuid not null references profiles(id) on delete cascade,
  visit_date date not null default current_date,
  watered boolean not null default false,
  petted boolean not null default false,
  primary key (visitor_id, target_user_id, visit_date)
);

alter table greenie_visits enable row level security;

create policy "visit records are viewable by everyone" on greenie_visits for select using (true);
create policy "users can insert own visit record" on greenie_visits for insert with check (auth.uid() = visitor_id);
create policy "users can update own visit record" on greenie_visits for update using (auth.uid() = visitor_id);

create index if not exists greenie_visits_target_idx on greenie_visits (target_user_id);
