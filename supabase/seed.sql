-- Green Thumb 샘플 데이터 시드
-- 화면이 비어보이지 않도록 시연/스크린샷용 예시 유저·게시물·식물·매물·방명록을 채워넣습니다.
-- 실제 서비스 오픈 전에는 이 데이터를 삭제하세요 (파일 하단 삭제 스크립트 참고).

-- 1. 시드 유저 3명 (auth.users + profiles는 트리거로 자동 생성)
insert into auth.users (instance_id, id, aud, role, email, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values
  ('00000000-0000-0000-0000-000000000000', 'a0000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'monstera.kim@seed.greenthumb.local', now(), '{"provider":"email","providers":["email"]}', '{"username":"몬스테라킴"}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', 'a0000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'minji.garden@seed.greenthumb.local', now(), '{"provider":"email","providers":["email"]}', '{"username":"초록집사민지"}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', 'a0000000-0000-0000-0000-000000000003', 'authenticated', 'authenticated', 'succulent.lover@seed.greenthumb.local', now(), '{"provider":"email","providers":["email"]}', '{"username":"다육이러버"}', now(), now())
on conflict (id) do nothing;

update profiles set location = '서울 마포구' where id = 'a0000000-0000-0000-0000-000000000001';
update profiles set location = '경기 성남시' where id = 'a0000000-0000-0000-0000-000000000002';
update profiles set location = '부산 해운대구' where id = 'a0000000-0000-0000-0000-000000000003';

-- 2. 샘플 식물 (실제 사진이 없어 photo_url은 비워두고 이모지 플레이스홀더로 표시)
insert into plants (owner_id, name, species, photo_url, acquired_date, last_watered_at, watering_interval_days)
values
  ('a0000000-0000-0000-0000-000000000001', '몽이', '몬스테라 델리시오사', null, '2025-11-02', '2026-07-15', 7),
  ('a0000000-0000-0000-0000-000000000002', '동전이', '필레아 페페로미오이데스', null, '2026-02-10', '2026-07-17', 5),
  ('a0000000-0000-0000-0000-000000000003', '스투', '스투키', null, '2025-08-20', '2026-07-01', 21)
on conflict do nothing;

-- 3. 샘플 게시물 (그룹별로 고르게 분포, 실제 사진이 없어 image_url은 비워둠)
insert into posts (author_id, plant_id, title, content, image_url, category, created_at)
values
  ('a0000000-0000-0000-0000-000000000001', (select id from plants where name='몽이'), '몽이한테 새잎이 났어요 🌿', '어제 아침에 봤을 때만 해도 없었는데, 오늘 보니까 작은 새잎이 돋아났더라구요! 몬스테라 키우는 재미가 이런 거군요.', null, 'showoff', now() - interval '2 hours'),
  ('a0000000-0000-0000-0000-000000000002', (select id from plants where name='동전이'), '필레아 번식 성공했어요', '엄마 화분 옆에 붙어있던 새끼를 분리해서 따로 심었는데 뿌리를 잘 내렸어요. 번식 팁 공유합니다.', null, 'tip', now() - interval '5 hours'),
  ('a0000000-0000-0000-0000-000000000003', (select id from plants where name='스투'), '스투키 잎이 물러졌는데 과습일까요?', '2주 전에 물 줬는데 밑동이 좀 물러진 것 같아요. 과습 맞을까요? 어떻게 해야 할지 조언 부탁드려요.', null, 'question', now() - interval '1 day'),
  ('a0000000-0000-0000-0000-000000000001', null, '우리집 거실 플랜테리어 완성!', '드디어 원하던 초록 가득한 거실이 됐어요. 조명이랑 화분 매치하는 게 제일 오래 걸렸네요.', null, 'diy', now() - interval '1 day 3 hours'),
  ('a0000000-0000-0000-0000-000000000002', null, '식물에 알쏭달쏭 잡학 하나 알려드려요', '식물도 밤에 숨을 쉰다는 거 아셨나요? 낮에는 광합성, 밤에는 호흡을 한대요 🌙', null, 'trivia', now() - interval '2 days'),
  ('a0000000-0000-0000-0000-000000000003', null, '오늘의 물주기 인증합니다 (루틴 5일차) 💧', '루틴 5일차! 오늘도 잊지 않고 물 줬어요. 다들 화이팅!', null, 'watering_proof', now() - interval '3 days'),
  ('a0000000-0000-0000-0000-000000000001', (select id from plants where name='몽이'), '몽이 성장 기록 3주차', '3주 전이랑 비교하면 확실히 키가 컸어요. 잎도 두 장 더 늘었습니다.', null, 'growth_proof', now() - interval '4 days'),
  ('a0000000-0000-0000-0000-000000000002', null, '이번주 루틴 챌린지 공지입니다', '이번 주는 분갈이 주간이에요! 분갈이 인증샷 남겨주시면 그린 뱃지 드려요.', null, 'challenge_notice', now() - interval '5 days')
on conflict do nothing;

-- 4. 샘플 반응 (물주기/햇빛)
insert into post_reactions (post_id, user_id, reaction_type)
select p.id, u.id, r.reaction_type
from posts p
cross join (values ('a0000000-0000-0000-0000-000000000001'::uuid), ('a0000000-0000-0000-0000-000000000002'::uuid), ('a0000000-0000-0000-0000-000000000003'::uuid)) as u(id)
cross join (values ('watering'), ('sunlight')) as r(reaction_type)
where p.author_id != u.id
on conflict do nothing;

-- 5. 샘플 댓글
insert into comments (post_id, author_id, content, created_at)
select p.id, 'a0000000-0000-0000-0000-000000000002'::uuid, '저도 오늘 새잎 발견했어요! 반갑네요 ㅎㅎ', now() - interval '1 hour'
from posts p where p.title like '몽이한테%'
union all
select p.id, 'a0000000-0000-0000-0000-000000000003'::uuid, '번식 방법 자세히 알려주실 수 있나요?', now() - interval '4 hours'
from posts p where p.title like '필레아 번식%'
union all
select p.id, 'a0000000-0000-0000-0000-000000000001'::uuid, '과습 맞는 것 같아요. 물 간격을 좀 늘려보세요!', now() - interval '20 hours'
from posts p where p.title like '스투키 잎이%';

-- 6. 샘플 로컬 장터 매물 (실제 사진이 없어 image_url은 비워둠)
insert into marketplace_listings (seller_id, title, description, category, price, location_text, image_url, status, created_at)
values
  ('a0000000-0000-0000-0000-000000000001', '몬스테라 삽수 나눔합니다', '마디 2개짜리 삽수 3개 나눔해요. 직거래만 가능합니다.', 'cutting', 0, '서울 마포구', null, 'available', now() - interval '6 hours'),
  ('a0000000-0000-0000-0000-000000000002', '알보 몬스테라 유묘 분양', '뿌리 튼튼하게 내린 유묘예요. 관심 있으신 분 쪽지 주세요.', 'rare_plant', 35000, '경기 성남시', null, 'available', now() - interval '1 day'),
  ('a0000000-0000-0000-0000-000000000003', '안 쓰는 토분 5개 무료 나눔', '사이즈 다양하게 5개 있어요. 가져가실 분!', 'supplies', 0, '부산 해운대구', null, 'available', now() - interval '2 days')
on conflict do nothing;

-- 7. 샘플 방명록
insert into guestbook_entries (author_id, region, message, sns_link, mood_emoji, best_plant_tag, created_at)
values
  ('a0000000-0000-0000-0000-000000000001', '마포동', '그린 썸 덕분에 물주기 안 까먹게 됐어요 🌿 다들 반가워요!', null, '🌱', '#몬스테라덕후', now() - interval '3 hours'),
  ('a0000000-0000-0000-0000-000000000002', '성남동', '이웃 분들 식물 자랑 구경하는 재미로 매일 들어와요', null, '☀️', '#필레아파', now() - interval '1 day'),
  ('a0000000-0000-0000-0000-000000000003', '해운대동', '다육이 키우시는 분들 친하게 지내요~', null, '🌵', '#다육이수집가', now() - interval '2 days')
on conflict do nothing;

-- ==== 삭제하고 싶을 때 아래 실행 ====
-- delete from auth.users where email like '%@seed.greenthumb.local';
