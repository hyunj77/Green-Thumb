import { supabase } from './supabase'

export async function fetchGrowthLogs(plantId) {
  const { data, error } = await supabase
    .from('growth_logs')
    .select('id, log_date, height_cm, note, photo_url, created_at')
    .eq('plant_id', plantId)
    .order('log_date', { ascending: false })
  return { data, error }
}

export async function createGrowthLog({ plantId, authorId, logDate, heightCm, note, photoUrl }) {
  const { data, error } = await supabase
    .from('growth_logs')
    .insert({
      plant_id: plantId,
      author_id: authorId,
      log_date: logDate || new Date().toISOString().slice(0, 10),
      height_cm: heightCm || null,
      note: note || null,
      photo_url: photoUrl || null,
    })
    .select('id, log_date, height_cm, note, photo_url, created_at')
    .single()
  return { data, error }
}

export async function deleteGrowthLog(id) {
  const { error } = await supabase.from('growth_logs').delete().eq('id', id)
  return { error }
}

// 오늘의 미션(사진/기록) 실서버 체크용 — 오늘 이 유저가 작성한 성장일기 전체
export async function fetchTodayGrowthLogsByAuthor(authorId) {
  const today = new Date().toISOString().slice(0, 10)
  const { data, error } = await supabase
    .from('growth_logs')
    .select('id, photo_url')
    .eq('author_id', authorId)
    .eq('log_date', today)
  return { data: data || [], error }
}

// 성장 타임랩스 카드에 표시할 식물별 사진 개수 (한 번의 쿼리로 일괄 조회)
export async function fetchPhotoCountsByPlantIds(plantIds) {
  if (!plantIds.length) return {}
  const { data } = await supabase
    .from('growth_logs')
    .select('plant_id')
    .in('plant_id', plantIds)
    .not('photo_url', 'is', null)
  const counts = {}
  ;(data || []).forEach((row) => { counts[row.plant_id] = (counts[row.plant_id] || 0) + 1 })
  return counts
}

// 특정 유저의 프로필에서 보여줄 성장일지 (사진이 있는 기록만)
export async function fetchGrowthLogsByAuthor(authorId, limit = 30) {
  const { data, error } = await supabase
    .from('growth_logs')
    .select('id, log_date, note, photo_url, created_at, plant:plants(id, name)')
    .eq('author_id', authorId)
    .not('photo_url', 'is', null)
    .order('created_at', { ascending: false })
    .limit(limit)
  return { data: data || [], error }
}

// 매거진 피드: 마이 그린 도감에 올라온 성장 사진들을 모아 보여준다
export async function fetchPublicGrowthFeed(limit = 12) {
  const { data, error } = await supabase
    .from('growth_logs')
    .select('id, log_date, note, photo_url, created_at, plant:plants(id, name, owner:profiles(id, username, garden_score))')
    .not('photo_url', 'is', null)
    .order('created_at', { ascending: false })
    .limit(limit)
  return { data: data || [], error }
}
