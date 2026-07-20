import { supabase } from './supabase'

export const CATEGORIES = ['general', 'question', 'showoff', 'tip']
export const CATEGORY_LABEL = {
  general: '자유',
  question: '질문',
  showoff: '신엽 자랑',
  tip: '꿀팁',
}
export const PAGE_SIZE = 10

export async function fetchPosts({ category, page = 1 } = {}) {
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  let query = supabase
    .from('posts')
    .select('id, title, content, image_url, category, created_at, author:profiles(username), plant:plants(name)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (category) query = query.eq('category', category)

  const { data, error, count } = await query
  return { data, error, count }
}

export async function fetchPostById(id) {
  const { data, error } = await supabase
    .from('posts')
    .select('*, author:profiles(id, username), plant:plants(id, name, species)')
    .eq('id', id)
    .single()
  return { data, error }
}

export async function fetchMyPosts(authorId) {
  const { data, error } = await supabase
    .from('posts')
    .select('id, title, category, created_at')
    .eq('author_id', authorId)
    .order('created_at', { ascending: false })
  return { data, error }
}

export async function createPost({ title, content, category, imageUrl, plantId, authorId }) {
  const { data, error } = await supabase
    .from('posts')
    .insert({ title, content, category, image_url: imageUrl || null, plant_id: plantId || null, author_id: authorId })
    .select()
    .single()
  return { data, error }
}

export async function updatePost(id, { title, content, category, imageUrl, plantId }) {
  const { data, error } = await supabase
    .from('posts')
    .update({ title, content, category, image_url: imageUrl || null, plant_id: plantId || null, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  return { data, error }
}

export async function deletePost(id) {
  const { error } = await supabase.from('posts').delete().eq('id', id)
  return { error }
}
