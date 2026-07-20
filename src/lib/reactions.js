import { supabase } from './supabase'

export async function fetchReactionCounts(postId) {
  const { data, error } = await supabase
    .from('post_reactions')
    .select('reaction_type, user_id')
    .eq('post_id', postId)
  return { data, error }
}

export async function addReaction({ postId, userId, reactionType }) {
  const { error } = await supabase
    .from('post_reactions')
    .insert({ post_id: postId, user_id: userId, reaction_type: reactionType })
  return { error }
}

export async function removeReaction({ postId, userId, reactionType }) {
  const { error } = await supabase
    .from('post_reactions')
    .delete()
    .eq('post_id', postId)
    .eq('user_id', userId)
    .eq('reaction_type', reactionType)
  return { error }
}
