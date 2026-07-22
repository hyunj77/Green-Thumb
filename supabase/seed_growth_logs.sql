-- 매거진 피드용 성장일기 샘플 (실제 위키미디어 커먼즈의 품종 일치 사진 사용)
insert into growth_logs (plant_id, author_id, log_date, height_cm, note, photo_url)
values
  (
    (select id from plants where name = '몽이'),
    'a0000000-0000-0000-0000-000000000001',
    '2026-07-15', 52, '새잎이 하나 더 나왔어요! 요즘 부쩍 자라는 느낌이에요 🌿',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Monstera_deliciosa2.jpg/500px-Monstera_deliciosa2.jpg'
  ),
  (
    (select id from plants where name = '동전이'),
    'a0000000-0000-0000-0000-000000000002',
    '2026-07-17', 12, '동그란 잎이 점점 더 풍성해지고 있어요',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Pilea_peperomioides_Chinese_money_plant.jpg/500px-Pilea_peperomioides_Chinese_money_plant.jpg'
  ),
  (
    (select id from plants where name = '스투'),
    'a0000000-0000-0000-0000-000000000003',
    '2026-07-01', 38, '스투키는 역시 관리가 편해서 좋아요',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Sansevieria_cylindrica_flowers_7.jpg/500px-Sansevieria_cylindrica_flowers_7.jpg'
  )
on conflict do nothing;
