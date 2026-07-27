import { supabase } from './supabase'

export async function fetchFollowingIds(userId) {
  if (!userId) return { data: [] }
  const { data, error } = await supabase.from('follows').select('followee_id').eq('follower_id', userId)
  return { data: (data || []).map((r) => r.followee_id), error }
}

export async function toggleFollow(followerId, followeeId, currentlyFollowing) {
  if (currentlyFollowing) {
    const { error } = await supabase.from('follows').delete().eq('follower_id', followerId).eq('followee_id', followeeId)
    return { error }
  }
  const { error } = await supabase.from('follows').insert({ follower_id: followerId, followee_id: followeeId })
  return { error }
}

// 추천 식집사: 식물을 많이 등록한 순으로, 본인 제외
export async function fetchSuggestedGardeners(excludeUserId, limit = 6) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, avatar_url, plants(count)')
    .neq('id', excludeUserId || '00000000-0000-0000-0000-000000000000')
    .limit(30)

  if (error) return { data: [], error }

  const normalized = (data || [])
    .map((p) => ({ ...p, plant_count: p.plants?.[0]?.count ?? 0 }))
    .filter((p) => p.plant_count > 0)
    .sort((a, b) => b.plant_count - a.plant_count)

  return { data: normalized.slice(0, limit), error: null }
}
