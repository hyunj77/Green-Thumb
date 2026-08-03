-- 로컬 장터를 별도 마켓 테이블 대신 커뮤니티 게시판(구매/판매/나눔)으로 통합하기 위해
-- posts에 가격/거래상태 컬럼을 추가한다.
-- Supabase 대시보드 SQL Editor에서 실행하세요.

alter table posts add column if not exists price integer;
alter table posts add column if not exists deal_status text not null default 'available';
alter table posts drop constraint if exists posts_deal_status_check;
alter table posts add constraint posts_deal_status_check check (deal_status in ('available', 'reserved', 'done'));
