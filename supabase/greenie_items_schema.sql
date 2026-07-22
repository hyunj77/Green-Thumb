-- 그린이 옷장: 장착 아이템 컬럼 추가 + 다른 유저 그린이 열람 허용
alter table greenies add column if not exists equipped_hat text;
alter table greenies add column if not exists equipped_accessory text;

drop policy if exists "users can view own greenie" on greenies;
create policy "anyone can view greenies" on greenies for select using (true);
