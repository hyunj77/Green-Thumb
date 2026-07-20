-- Green Thumb 성장일기(Growth Log) 스키마
-- Supabase 대시보드 > SQL Editor 에 붙여넣고 Run 하세요.

create table if not exists growth_logs (
  id bigint generated always as identity primary key,
  plant_id bigint not null references plants(id) on delete cascade,
  author_id uuid not null references profiles(id) on delete cascade,
  log_date date not null default current_date,
  height_cm numeric,
  note text,
  photo_url text,
  created_at timestamptz not null default now()
);

alter table growth_logs enable row level security;

create policy "growth logs are viewable by everyone" on growth_logs for select using (true);
create policy "users can insert own growth logs" on growth_logs for insert with check (auth.uid() = author_id);
create policy "users can update own growth logs" on growth_logs for update using (auth.uid() = author_id);
create policy "users can delete own growth logs" on growth_logs for delete using (auth.uid() = author_id);
