-- 등급 배지를 커뮤니티 게시글/댓글에도 노출하기 위해, 매번 식물을 조회해서
-- 계산하는 대신 profiles에 점수를 캐싱해둔다 (식물 등록/삭제 시점에 갱신).
-- Supabase 대시보드 SQL Editor에서 실행하세요.

alter table profiles add column if not exists garden_score integer not null default 0;
