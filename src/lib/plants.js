import { supabase } from './supabase'

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

export async function deletePlant(id) {
  const { error } = await supabase.from('plants').delete().eq('id', id)
  return { error }
}

export function nextWateringDate(plant) {
  if (!plant.last_watered_at) return null
  const last = new Date(plant.last_watered_at)
  last.setDate(last.getDate() + (plant.watering_interval_days || 7))
  return last
}
