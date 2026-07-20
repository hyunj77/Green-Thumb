import { supabase } from './supabase'

export const MARKET_CATEGORIES = ['rare_plant', 'common_plant', 'cutting', 'supplies']
export const MARKET_CATEGORY_LABEL = {
  rare_plant: '희귀식물 전문',
  common_plant: '일반 관엽',
  cutting: '삽수/유묘',
  supplies: '원예 장비/흙/화분',
}

export const DEAL_TYPES = ['sale', 'buy', 'free']
export const DEAL_TYPE_LABEL = {
  sale: '판매',
  buy: '구매',
  free: '나눔',
}

export const REGIONS = ['서울', '경기', '인천', '부산', '대구', '광주', '대전', '울산', '세종', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주']

export async function fetchListings({ category, region, dealType } = {}) {
  let query = supabase
    .from('marketplace_listings')
    .select('id, title, price, category, region, location_text, deal_type, image_url, status, created_at, seller:profiles(username)')
    .order('created_at', { ascending: false })

  if (category) query = query.eq('category', category)
  if (region) query = query.eq('region', region)
  if (dealType) query = query.eq('deal_type', dealType)

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

export async function createListing({ sellerId, title, description, category, dealType, price, region, locationText, imageUrl }) {
  const { data, error } = await supabase
    .from('marketplace_listings')
    .insert({
      seller_id: sellerId,
      title,
      description: description || null,
      category,
      deal_type: dealType || 'sale',
      price: price || 0,
      region: region || null,
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
