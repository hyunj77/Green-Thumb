import { supabase } from './supabase'

export async function fetchMyBookmarkedPostIds(userId) {
  const { data, error } = await supabase.from('post_bookmarks').select('post_id').eq('user_id', userId)
  return { data: (data || []).map((row) => row.post_id), error }
}

export async function fetchMyBookmarks(userId) {
  const { data, error } = await supabase
    .from('post_bookmarks')
    .select('id, created_at, post:posts(id, title, image_url, category, created_at, author:profiles(username))')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  return { data: data || [], error }
}

export async function addBookmark({ postId, userId }) {
  const { error } = await supabase.from('post_bookmarks').insert({ post_id: postId, user_id: userId })
  return { error }
}

export async function removeBookmark({ postId, userId }) {
  const { error } = await supabase.from('post_bookmarks').delete().eq('post_id', postId).eq('user_id', userId)
  return { error }
}
