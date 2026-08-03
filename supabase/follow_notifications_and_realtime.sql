-- 1. 팔로우 시에도 알림이 가도록 notifications.type에 'follow'를 추가하고 트리거를 단다.
-- 2. 메시지/알림 실시간 반영을 위해 두 테이블을 Realtime publication에 추가한다.
-- Supabase 대시보드 SQL Editor에서 실행하세요.

alter table notifications drop constraint if exists notifications_type_check;
alter table notifications
  add constraint notifications_type_check
  check (type in ('comment', 'reaction', 'message', 'watering', 'follow'));

create or replace function public.notify_on_follow()
returns trigger as $$
begin
  insert into notifications (user_id, type, actor_id)
  values (new.followee_id, 'follow', new.follower_id);
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_follow_created on follows;
create trigger on_follow_created
  after insert on follows
  for each row execute procedure public.notify_on_follow();

-- Realtime: 이미 publication에 포함돼 있으면 에러 없이 무시된다.
do $$
begin
  alter publication supabase_realtime add table messages;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table notifications;
exception when duplicate_object then null;
end $$;
