import { supabase } from './supabase'

export async function uploadAvatar(userId, file) {
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase()
  const path = `${userId}/avatar-${Date.now()}.${ext}`
  const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true, cacheControl: '3600' })
  if (error) return { url: null, error }
  const { data } = supabase.storage.from('avatars').getPublicUrl(path)
  return { url: data.publicUrl, error: null }
}

// 게시글/식물/장터/성장일기 사진 공용 업로드 — 'uploads' 버킷 안에 기능별 폴더로 나눠 저장한다.
// folder 예: 'posts' | 'plants' | 'listings' | 'growth'
export async function uploadImage(folder, userId, file) {
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase()
  const path = `${userId}/${folder}/${Date.now()}.${ext}`
  const { error } = await supabase.storage.from('uploads').upload(path, file, { upsert: true, cacheControl: '3600' })
  if (error) return { url: null, error }
  const { data } = supabase.storage.from('uploads').getPublicUrl(path)
  return { url: data.publicUrl, error: null }
}
