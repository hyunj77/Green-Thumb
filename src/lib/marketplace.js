import { supabase } from './supabase'

export const MARKET_CATEGORIES = ['rare_plant', 'common_plant', 'cutting', 'supplies']
export const MARKET_CATEGORY_LABEL = {
  rare_plant: '희귀식물 전문',
  common_plant: '일반 관엽',
  cutting: '삽수/유묘',
  supplies: '원예 장비/흙/화분',
}

export async function fetchListings({ category } = {}) {
  let query = supabase
    .from('marketplace_listings')
    .select('id, title, price, category, location_text, image_url, status, created_at, seller:profiles(username)')
    .order('created_at', { ascending: false })

  if (category) query = query.eq('category', category)

  const { data, error } = await query
  return { data, error }
}

export async function fetchListingById(id) {
  const { data, error } = await supabase
    .from('marketplace_listings')
    .select('*, seller:profiles(id, username)')
    .eq('id', id)
    .single()
  return { data, error }
}

export async function createListing({ sellerId, title, description, category, price, locationText, imageUrl }) {
  const { data, error } = await supabase
    .from('marketplace_listings')
    .insert({
      seller_id: sellerId,
      title,
      description: description || null,
      category,
      price: price || 0,
      location_text: locationText || null,
      image_url: imageUrl || null,
    })
    .select()
    .single()
  return { data, error }
}

export async function updateListingStatus(id, status) {
  const { error } = await supabase.from('marketplace_listings').update({ status }).eq('id', id)
  return { error }
}

export async function deleteListing(id) {
  const { error } = await supabase.from('marketplace_listings').delete().eq('id', id)
  return { error }
}
