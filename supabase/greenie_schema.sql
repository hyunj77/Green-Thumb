-- 그린이 키우기 미니게임 (터치할수록 성장, 레벨 1~1000)
create table if not exists greenies (
  user_id uuid primary key references profiles(id) on delete cascade,
  level integer not null default 1 check (level between 1 and 1000),
  exp integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table greenies enable row level security;

create policy "users can view own greenie" on greenies for select using (auth.uid() = user_id);
create policy "users can insert own greenie" on greenies for insert with check (auth.uid() = user_id);
create policy "users can update own greenie" on greenies for update using (auth.uid() = user_id);
