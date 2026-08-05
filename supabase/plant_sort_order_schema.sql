-- 마이 그린 도감에서 식물 순서를 직접 바꿀 수 있게 정렬 순서 컬럼 추가
alter table plants add column if not exists sort_order bigint;

-- 기존에 등록된 식물들은 만든 날짜가 오래된 순으로 1,2,3... 순번을 채워준다
-- (신규로 등록되는 식물은 앱에서 sort_order를 직접 넣어주므로 여기서는 과거 데이터만 채움)
with ranked as (
  select id, row_number() over (partition by owner_id order by created_at asc) as rn
  from plants
  where sort_order is null
)
update plants set sort_order = ranked.rn
from ranked
where plants.id = ranked.id;
