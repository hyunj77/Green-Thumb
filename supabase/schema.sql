-- Green Thumb (그린 썸) 초기 스키마
-- Supabase 대시보드 > SQL Editor 에 붙여넣고 Run 하세요.

-- 1. profiles: auth.users 확장 (회원 정보)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  avatar_url text,
  bio text,
  location text,
  created_at timestamptz not null default now()
);

-- 2. plants: 마이 그린 도감 (유저가 등록한 반려식물)
create table if not exists plants (
  id bigint generated always as identity primary key,
  owner_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  species text,
  photo_url text,
  acquired_date date,
  last_watered_at date,
  watering_interval_days integer default 7,
  created_at timestamptz not null default now()
);

-- 3. posts: 소셜 피드 게시물 ('신엽 부심' 자랑 피드)
create table if not exists posts (
  id bigint generated always as identity primary key,
  author_id uuid not null references profiles(id) on delete cascade,
  plant_id bigint references plants(id) on delete set null,
  title text not null,
  content text,
  image_url text,
  category text default 'general',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4. comments: 게시물 댓글
create table if not exists comments (
  id bigint generated always as identity primary key,
  post_id bigint not null references posts(id) on delete cascade,
  author_id uuid not null references profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

-- 5. post_reactions: '좋아요' 대신 물주기 / 햇빛 쬐어주기 인터랙션
create table if not exists post_reactions (
  id bigint generated always as identity primary key,
  post_id bigint not null references posts(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  reaction_type text not null check (reaction_type in ('watering', 'sunlight')),
  created_at timestamptz not null default now(),
  unique (post_id, user_id, reaction_type)
);

-- 6. marketplace_listings: GPS 기반 로컬 삽수/용품 교환 장터 (MVP: 위치 텍스트/좌표 저장까지)
create table if not exists marketplace_listings (
  id bigint generated always as identity primary key,
  seller_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  description text,
  category text not null check (category in ('rare_plant', 'common_plant', 'cutting', 'supplies')),
  price integer default 0,
  location_text text,
  latitude double precision,
  longitude double precision,
  image_url text,
  status text not null default 'available' check (status in ('available', 'reserved', 'sold')),
  created_at timestamptz not null default now()
);

-- ==== Row Level Security ====
alter table profiles enable row level security;
alter table plants enable row level security;
alter table posts enable row level security;
alter table comments enable row level security;
alter table post_reactions enable row level security;
alter table marketplace_listings enable row level security;

-- profiles: 전체 공개 조회, 본인만 수정
create policy "profiles are viewable by everyone" on profiles for select using (true);
create policy "users can insert own profile" on profiles for insert with check (auth.uid() = id);
create policy "users can update own profile" on profiles for update using (auth.uid() = id);

-- plants: 전체 공개 조회, 본인만 등록/수정/삭제
create policy "plants are viewable by everyone" on plants for select using (true);
create policy "users can insert own plants" on plants for insert with check (auth.uid() = owner_id);
create policy "users can update own plants" on plants for update using (auth.uid() = owner_id);
create policy "users can delete own plants" on plants for delete using (auth.uid() = owner_id);

-- posts
create policy "posts are viewable by everyone" on posts for select using (true);
create policy "users can insert own posts" on posts for insert with check (auth.uid() = author_id);
create policy "users can update own posts" on posts for update using (auth.uid() = author_id);
create policy "users can delete own posts" on posts for delete using (auth.uid() = author_id);

-- comments
create policy "comments are viewable by everyone" on comments for select using (true);
create policy "users can insert own comments" on comments for insert with check (auth.uid() = author_id);
create policy "users can update own comments" on comments for update using (auth.uid() = author_id);
create policy "users can delete own comments" on comments for delete using (auth.uid() = author_id);

-- post_reactions
create policy "reactions are viewable by everyone" on post_reactions for select using (true);
create policy "users can insert own reactions" on post_reactions for insert with check (auth.uid() = user_id);
create policy "users can delete own reactions" on post_reactions for delete using (auth.uid() = user_id);

-- marketplace_listings
create policy "listings are viewable by everyone" on marketplace_listings for select using (true);
create policy "users can insert own listings" on marketplace_listings for insert with check (auth.uid() = seller_id);
create policy "users can update own listings" on marketplace_listings for update using (auth.uid() = seller_id);
create policy "users can delete own listings" on marketplace_listings for delete using (auth.uid() = seller_id);

-- 신규 가입 시 profiles row 자동 생성 트리거
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (new.id, coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)));
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
