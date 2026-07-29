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

// 매거진 피드: 마이 그린 도감에 올라온 성장 사진들을 모아 보여준다
export async function fetchPublicGrowthFeed(limit = 12) {
  const { data, error } = await supabase
    .from('growth_logs')
    .select('id, log_date, note, photo_url, created_at, plant:plants(id, name, owner:profiles(id, username))')
    .not('photo_url', 'is', null)
    .order('created_at', { ascending: false })
    .limit(limit)
  return { data: data || [], error }
}
