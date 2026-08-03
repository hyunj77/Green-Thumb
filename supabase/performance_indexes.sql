-- 자주 필터링/조인되는 컬럼에 인덱스를 추가한다.
-- Supabase 대시보드 SQL Editor에서 실행하세요.

create index if not exists plants_owner_id_idx on plants (owner_id);
create index if not exists posts_author_id_idx on posts (author_id);
create index if not exists posts_category_idx on posts (category);
create index if not exists comments_post_id_idx on comments (post_id);
create index if not exists comments_author_id_idx on comments (author_id);
create index if not exists post_reactions_user_id_idx on post_reactions (user_id);
create index if not exists follows_followee_id_idx on follows (followee_id);
create index if not exists growth_logs_author_id_idx on growth_logs (author_id);
create index if not exists growth_logs_plant_id_idx on growth_logs (plant_id);
create index if not exists marketplace_listings_seller_id_idx on marketplace_listings (seller_id);
create index if not exists marketplace_listings_category_idx on marketplace_listings (category);
create index if not exists marketplace_listings_status_idx on marketplace_listings (status);
