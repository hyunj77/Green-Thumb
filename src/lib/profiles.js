import { supabase } from './supabase'

// 유저(닉네임) 검색 — 커뮤니티 검색창에서 게시글과 함께 결과를 보여준다
export async function searchProfiles(query, limit = 6) {
  const q = query.trim()
  if (!q) return { data: [], error: null }
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, avatar_url, garden_score')
    .ilike('username', `%${q}%`)
    .limit(limit)
  return { data: data || [], error }
}
