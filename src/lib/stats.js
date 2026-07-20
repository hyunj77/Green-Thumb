import { supabase } from './supabase'

export async function fetchMyStats(userId) {
  const [postCount, plantCount, reactionCount, commentCount] = await Promise.all([
    supabase.from('posts').select('id', { count: 'exact', head: true }).eq('author_id', userId),
    supabase.from('plants').select('id', { count: 'exact', head: true }).eq('owner_id', userId),
    supabase.from('post_reactions').select('id, posts!inner(author_id)', { count: 'exact', head: true }).eq('posts.author_id', userId),
    supabase.from('comments').select('id, posts!inner(author_id)', { count: 'exact', head: true }).eq('posts.author_id', userId),
  ])

  return {
    postCount: postCount.count || 0,
    plantCount: plantCount.count || 0,
    reactionCount: reactionCount.count || 0,
    commentCount: commentCount.count || 0,
  }
}
