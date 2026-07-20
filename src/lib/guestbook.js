import { supabase } from './supabase'

export const MOOD_EMOJIS = ['🌱', '🌿', '🌻', '🌵', '☀️', '💧', '🥀']

export async function fetchGuestbookEntries(limit = 20) {
  const { data, error } = await supabase
    .from('guestbook_entries')
    .select('id, region, message, sns_link, mood_emoji, best_plant_tag, created_at, author:profiles(id, username)')
    .order('created_at', { ascending: false })
    .limit(limit)
  return { data, error }
}

export async function createGuestbookEntry({ authorId, region, message, email, snsLink, moodEmoji, bestPlantTag }) {
  const { data, error } = await supabase
    .from('guestbook_entries')
    .insert({
      author_id: authorId,
      region: region || null,
      message,
      email: email || null,
      sns_link: snsLink || null,
      mood_emoji: moodEmoji || null,
      best_plant_tag: bestPlantTag || null,
    })
    .select('id, region, message, sns_link, mood_emoji, best_plant_tag, created_at, author:profiles(id, username)')
    .single()
  return { data, error }
}

export async function deleteGuestbookEntry(id) {
  const { error } = await supabase.from('guestbook_entries').delete().eq('id', id)
  return { error }
}

export async function fetchStampCounts(entryIds) {
  if (!entryIds.length) return { data: [], error: null }
  const { data, error } = await supabase
    .from('guestbook_stamps')
    .select('entry_id, user_id')
    .in('entry_id', entryIds)
  return { data, error }
}

export async function addStamp({ entryId, userId }) {
  const { error } = await supabase.from('guestbook_stamps').insert({ entry_id: entryId, user_id: userId })
  return { error }
}

export async function removeStamp({ entryId, userId }) {
  const { error } = await supabase
    .from('guestbook_stamps')
    .delete()
    .eq('entry_id', entryId)
    .eq('user_id', userId)
  return { error }
}
