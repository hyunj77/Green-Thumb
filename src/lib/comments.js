import { supabase } from './supabase'

export async function fetchComments(postId) {
  const { data, error } = await supabase
    .from('comments')
    .select('id, content, created_at, author:profiles(id, username)')
    .eq('post_id', postId)
    .order('created_at', { ascending: true })
  return { data, error }
}

export async function createComment({ postId, authorId, content }) {
  const { data, error } = await supabase
    .from('comments')
    .insert({ post_id: postId, author_id: authorId, content })
    .select('id, content, created_at, author:profiles(id, username)')
    .single()
  return { data, error }
}

export async function deleteComment(id) {
  const { error } = await supabase.from('comments').delete().eq('id', id)
  return { error }
}
