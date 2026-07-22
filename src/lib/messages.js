import { supabase } from './supabase'

// 대화 상대 목록: 내가 보냈거나 받은 쪽지들을 상대방 기준으로 묶어서 최신순으로 반환
export async function fetchConversations(userId) {
  const { data, error } = await supabase
    .from('messages')
    .select('id, content, created_at, sender_id, recipient_id, sender:profiles!messages_sender_id_fkey(id, username), recipient:profiles!messages_recipient_id_fkey(id, username)')
    .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
    .order('created_at', { ascending: false })

  if (error) return { data: [], error }

  const byPartner = new Map()
  for (const m of data) {
    const partner = m.sender_id === userId ? m.recipient : m.sender
    if (!partner || byPartner.has(partner.id)) continue
    byPartner.set(partner.id, { partner, lastMessage: m })
  }
  return { data: Array.from(byPartner.values()), error: null }
}

export async function fetchMessagesWith(userId, otherUserId) {
  const { data, error } = await supabase
    .from('messages')
    .select('id, content, created_at, sender_id, recipient_id')
    .or(`and(sender_id.eq.${userId},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${userId})`)
    .order('created_at', { ascending: true })
  return { data: data || [], error }
}

export async function sendMessage({ senderId, recipientId, content }) {
  const { data, error } = await supabase
    .from('messages')
    .insert({ sender_id: senderId, recipient_id: recipientId, content })
    .select()
    .single()
  return { data, error }
}
