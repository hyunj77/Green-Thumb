-- 로컬 장터 샘플 매물 추가 (지역/거래유형 다양화)
-- 기존 seed.sql의 시드 유저 3명을 재사용합니다. 먼저 supabase/seed.sql을 실행한 뒤 이 파일을 실행하세요.

insert into marketplace_listings (seller_id, title, description, category, price, region, location_text, deal_type, image_url, status, created_at)
values
  ('a0000000-0000-0000-0000-000000000001', '몬스테라 알보 구합니다', '알보 몬스테라 유묘 구해요. 서울 지역 직거래 원해요.', 'rare_plant', 50000, '서울', '서울 마포구', 'buy', null, 'available', now() - interval '8 hours'),
  ('a0000000-0000-0000-0000-000000000002', '스투키 새끼 나눔해요', '분갈이하다 나온 새끼 스투키 3개 나눔합니다.', 'common_plant', 0, '경기', '경기 성남시', 'free', null, 'available', now() - interval '10 hours'),
  ('a0000000-0000-0000-0000-000000000003', '다육이 모음 판매', '다육이 10종 모음, 화분 포함 판매합니다.', 'common_plant', 25000, '부산', '부산 해운대구', 'sale', null, 'available', now() - interval '1 day'),
  ('a0000000-0000-0000-0000-000000000001', '테이블야자 구매 희망', '테이블야자 중형 사이즈 구매하고 싶어요.', 'common_plant', 20000, '인천', '인천 연수구', 'buy', null, 'available', now() - interval '1 day 4 hours'),
  ('a0000000-0000-0000-0000-000000000002', '화분 및 배양토 나눔', '이사하면서 화분이랑 배양토 남은 거 나눔해요.', 'supplies', 0, '대구', '대구 수성구', 'free', null, 'available', now() - interval '2 days'),
  ('a0000000-0000-0000-0000-000000000003', '금전수 삽수 판매', '마디 3개짜리 금전수 삽수 판매합니다.', 'cutting', 5000, '대전', '대전 유성구', 'sale', null, 'available', now() - interval '2 days 6 hours'),
  ('a0000000-0000-0000-0000-000000000001', '올리브나무 구합니다', '중형 올리브나무 구해요. 광주 근처면 좋겠어요.', 'common_plant', 40000, '광주', '광주 서구', 'buy', null, 'available', now() - interval '3 days'),
  ('a0000000-0000-0000-0000-000000000002', '희귀 필로덴드론 분양', '핑크 프린세스 필로덴드론 분양합니다.', 'rare_plant', 80000, '강원', '강원 춘천시', 'sale', null, 'available', now() - interval '3 days 12 hours'),
  ('a0000000-0000-0000-0000-000000000003', '제주 감귤나무 화분 나눔', '작은 감귤나무 화분 나눔해요. 직접 오셔야 해요.', 'common_plant', 0, '제주', '제주 제주시', 'free', null, 'available', now() - interval '4 days')
on conflict do nothing;
