import { supabase } from './supabase'
import { computeGardenScore } from './grade'
import mongiPhoto from '../assets/몬스테라2.png'

// 커뮤니티 게시글/댓글에 등급 배지를 바로 노출할 수 있도록, 식물이 늘거나
// 줄어들 때마다 점수를 profiles에 캐싱해둔다 (매번 plants를 조회하지 않기 위해).
export async function syncGardenScore(ownerId) {
  const { data } = await supabase.from('plants').select('species').eq('owner_id', ownerId)
  const score = computeGardenScore(data || [])
  await supabase.from('profiles').update({ garden_score: score }).eq('id', ownerId)
}

export const SAMPLE_PLANTS = [
  { id: 'sample-1', name: '몬스테라 몽이', species: '몬스테라 델리시오사', photo_url: mongiPhoto, last_watered_at: '2026-07-15', watering_interval_days: 7 },
  { id: 'sample-2', name: '스투키 스투', species: '스투키', photo_url: '', last_watered_at: '2026-07-05', watering_interval_days: 21 },
  { id: 'sample-3', name: '필레아 동전이', species: '필레아 페페로미오이데스', photo_url: '', last_watered_at: '2026-07-17', watering_interval_days: 5 },
]

export async function fetchMyPlants(ownerId) {
  const { data, error } = await supabase
    .from('plants')
    .select('*')
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false })
  return { data, error }
}

export async function fetchPlantById(id) {
  const { data, error } = await supabase
    .from('plants')
    .select('*, owner:profiles(id, username)')
    .eq('id', id)
    .single()
  return { data, error }
}

export async function createPlant({ ownerId, name, species, photoUrl, acquiredDate, wateringIntervalDays }) {
  const { data, error } = await supabase
    .from('plants')
    .insert({
      owner_id: ownerId,
      name,
      species: species || null,
      photo_url: photoUrl || null,
      acquired_date: acquiredDate || null,
      watering_interval_days: wateringIntervalDays || 7,
    })
    .select()
    .single()
  if (data) await syncGardenScore(ownerId)
  return { data, error }
}

export async function waterPlant(id) {
  const { data, error } = await supabase
    .from('plants')
    .update({ last_watered_at: new Date().toISOString().slice(0, 10) })
    .eq('id', id)
    .select()
    .single()
  return { data, error }
}

export async function fertilizePlant(id) {
  const { data, error } = await supabase
    .from('plants')
    .update({ last_fertilized_at: new Date().toISOString().slice(0, 10) })
    .eq('id', id)
    .select()
    .single()
  return { data, error }
}

export async function updateFertilizingInterval(id, days) {
  const { data, error } = await supabase
    .from('plants')
    .update({ fertilizing_interval_days: days })
    .eq('id', id)
    .select()
    .single()
  return { data, error }
}

export async function updatePlantPhoto(id, photoUrl) {
  const { data, error } = await supabase
    .from('plants')
    .update({ photo_url: photoUrl })
    .eq('id', id)
    .select()
    .single()
  return { data, error }
}

export async function updateWateringInterval(id, days) {
  const { data, error } = await supabase
    .from('plants')
    .update({ watering_interval_days: days })
    .eq('id', id)
    .select()
    .single()
  return { data, error }
}

export async function deletePlant(id, ownerId) {
  const { error } = await supabase.from('plants').delete().eq('id', id)
  if (!error && ownerId) await syncGardenScore(ownerId)
  return { error }
}

export function nextWateringDate(plant) {
  if (!plant.last_watered_at) return null
  const last = new Date(plant.last_watered_at)
  last.setDate(last.getDate() + (plant.watering_interval_days || 7))
  return last
}

export function nextFertilizingDate(plant) {
  if (!plant.last_fertilized_at) return null
  const last = new Date(plant.last_fertilized_at)
  last.setDate(last.getDate() + (plant.fertilizing_interval_days || 30))
  return last
}
