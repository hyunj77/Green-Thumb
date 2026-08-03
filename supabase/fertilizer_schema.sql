-- 식물 카드/캘린더에 영양제(비료) 기록을 추가하기 위한 컬럼.
-- 기존 물주기(last_watered_at, watering_interval_days)와 동일한 패턴으로,
-- 마지막 비료 준 날짜 + 주기를 저장한다.
-- Supabase 대시보드 SQL Editor에서 실행하세요.

alter table plants add column if not exists last_fertilized_at date;
alter table plants add column if not exists fertilizing_interval_days integer default 30;
