import { supabase } from './supabase'

export async function fetchMyNotifications(userId, limit = 30) {
  const { data, error } = await supabase
    .from('notifications')
    .select('id, type, content_preview, is_read, created_at, post_id, message_id, actor:profiles(id, username)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)
  return { data: data || [], error }
}

export async function fetchUnreadCount(userId) {
  const { count, error } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false)
  return { count: count || 0, error }
}

export async function markNotificationRead(id) {
  const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', id)
  return { error }
}

export async function markAllNotificationsRead(userId) {
  const { error } = await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId).eq('is_read', false)
  return { error }
}
