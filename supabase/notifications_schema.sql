-- Green Thumb 알림(댓글/공감/쪽지) + 쪽지 스키마

create table if not exists messages (
  id bigint generated always as identity primary key,
  sender_id uuid not null references profiles(id) on delete cascade,
  recipient_id uuid not null references profiles(id) on delete cascade,
  content text not null check (char_length(content) <= 1000),
  created_at timestamptz not null default now()
);

create table if not exists notifications (
  id bigint generated always as identity primary key,
  user_id uuid not null references profiles(id) on delete cascade,
  type text not null check (type in ('comment', 'reaction', 'message')),
  actor_id uuid references profiles(id) on delete set null,
  post_id bigint references posts(id) on delete cascade,
  message_id bigint references messages(id) on delete cascade,
  content_preview text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_idx on notifications (user_id, created_at desc);
create index if not exists messages_recipient_idx on messages (recipient_id, created_at desc);
create index if not exists messages_sender_idx on messages (sender_id, created_at desc);

alter table messages enable row level security;
alter table notifications enable row level security;

create policy "users can view own messages" on messages for select
  using (auth.uid() = sender_id or auth.uid() = recipient_id);
create policy "users can send messages" on messages for insert
  with check (auth.uid() = sender_id);

create policy "users can view own notifications" on notifications for select
  using (auth.uid() = user_id);
create policy "users can update own notifications" on notifications for update
  using (auth.uid() = user_id);
create policy "users can delete own notifications" on notifications for delete
  using (auth.uid() = user_id);
-- notifications INSERT는 클라이언트가 직접 하지 않고, 아래 트리거(SECURITY DEFINER)가 대신 처리한다.
-- 그래서 일반 사용자를 위한 insert 정책은 두지 않는다 (RLS로 위조 알림 생성을 원천 차단).

-- 댓글이 달리면 게시물 작성자에게 알림
create or replace function public.notify_on_comment()
returns trigger as $$
declare
  post_owner uuid;
begin
  select author_id into post_owner from posts where id = new.post_id;
  if post_owner is not null and post_owner != new.author_id then
    insert into notifications (user_id, type, actor_id, post_id, content_preview)
    values (post_owner, 'comment', new.author_id, new.post_id, left(new.content, 80));
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_comment_created on comments;
create trigger on_comment_created
  after insert on comments
  for each row execute procedure public.notify_on_comment();

-- 물주기/햇빛 반응이 달리면 게시물 작성자에게 알림
create or replace function public.notify_on_reaction()
returns trigger as $$
declare
  post_owner uuid;
begin
  select author_id into post_owner from posts where id = new.post_id;
  if post_owner is not null and post_owner != new.user_id then
    insert into notifications (user_id, type, actor_id, post_id, content_preview)
    values (post_owner, 'reaction', new.user_id, new.post_id,
      case new.reaction_type when 'watering' then '물주기 반응을 남겼어요' else '햇빛 쬐어주기 반응을 남겼어요' end);
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_reaction_created on post_reactions;
create trigger on_reaction_created
  after insert on post_reactions
  for each row execute procedure public.notify_on_reaction();

-- 쪽지를 보내면 받는 사람에게 알림
create or replace function public.notify_on_message()
returns trigger as $$
begin
  insert into notifications (user_id, type, actor_id, message_id, content_preview)
  values (new.recipient_id, 'message', new.sender_id, new.id, left(new.content, 80));
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_message_created on messages;
create trigger on_message_created
  after insert on messages
  for each row execute procedure public.notify_on_message();
