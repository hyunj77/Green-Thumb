-- 물주기 알람 (일 1회 pg_cron으로 자동 점검, 알림센터에 알림 생성)

create extension if not exists pg_cron;

alter table plants add column if not exists last_reminder_sent_at date;

alter table notifications drop constraint if exists notifications_type_check;
alter table notifications add constraint notifications_type_check
  check (type in ('comment', 'reaction', 'message', 'watering'));

alter table notifications add column if not exists plant_id bigint references plants(id) on delete cascade;

create or replace function public.check_watering_reminders()
returns void as $$
begin
  insert into notifications (user_id, type, plant_id, content_preview)
  select p.owner_id, 'watering', p.id, p.name || ' 물 줄 시간이에요! 🌱'
  from plants p
  where p.last_watered_at is not null
    and (p.last_watered_at + (p.watering_interval_days || ' days')::interval) <= current_date
    and (p.last_reminder_sent_at is null or p.last_reminder_sent_at < current_date);

  update plants
  set last_reminder_sent_at = current_date
  where last_watered_at is not null
    and (last_watered_at + (watering_interval_days || ' days')::interval) <= current_date
    and (last_reminder_sent_at is null or last_reminder_sent_at < current_date);
end;
$$ language plpgsql security definer set search_path = public;

select cron.schedule(
  'watering-reminders-daily',
  '0 0 * * *', -- 매일 UTC 00:00 (한국시간 오전 9시)
  $$select public.check_watering_reminders();$$
);
