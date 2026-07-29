-- post_reactions.reaction_type 제약조건에 'like'를 추가한다.
-- 코드(PostDetail.jsx)는 좋아요를 reaction_type='like'로 저장하는데
-- 기존 제약조건이 'watering'/'sunlight'만 허용하고 있어서 좋아요가 실패하던 버그를 고친다.
-- 기존 watering/sunlight 값과의 호환성은 그대로 유지된다.
-- Supabase 대시보드 SQL Editor에서 실행하세요.

alter table post_reactions drop constraint if exists post_reactions_reaction_type_check;
alter table post_reactions
  add constraint post_reactions_reaction_type_check
  check (reaction_type in ('watering', 'sunlight', 'like'));
