import { supabase } from './supabase'

// 게시판 메뉴: 틔운카페의 '일상 게시판 + 루틴 프로그램' 2단 구성을 그린 썸 방식으로 재해석
// - 일상 속 우리 식물: 자유로운 커뮤니티 소통
// - 그린 썸 루틴 챌린지: 물주기·성장일기 기록을 인증하는 게이미피케이션 게시판
export const CATEGORY_GROUPS = [
  {
    title: '🌿 일상 속 우리 식물',
    categories: ['diary', 'showoff', 'tip', 'question', 'diy', 'trivia'],
  },
  {
    title: '🏆 그린 썸 루틴 챌린지',
    categories: ['challenge_notice', 'watering_proof', 'growth_proof'],
  },
]

export const CATEGORY_LABEL = {
  diary: '식물 이야기',
  showoff: '플랜테리어 자랑',
  tip: '번식·삽수 꿀팁',
  question: '초보 집사 질문',
  diy: 'DIY 화분·소품',
  trivia: '알쏭달쏭 식물잡학',
  challenge_notice: '챌린지 공지',
  watering_proof: '데일리 물주기 인증',
  growth_proof: '성장 기록 인증',
}

export const CATEGORIES = CATEGORY_GROUPS.flatMap((g) => g.categories)
export const PAGE_SIZE = 10

export async function fetchPosts({ category, categories, search, page = 1, sort = 'recent' } = {}) {
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  let query = supabase
    .from('posts')
    .select(
      'id, title, content, image_url, category, created_at, author:profiles(id, username), plant:plants(name), comments(count), post_reactions(count)',
      { count: 'exact' },
    )
    .order('created_at', { ascending: false })

  if (category) query = query.eq('category', category)
  else if (categories?.length) query = query.in('category', categories)
  if (search) query = query.ilike('title', `%${search}%`)

  // 인기순: 반응+댓글 합산 정렬은 DB 집계 정렬이 어려워, 넉넉히 가져와 클라이언트에서 정렬 후 페이지를 잘라낸다
  if (sort === 'popular') query = query.limit(100)
  else query = query.range(from, to)

  const { data, error, count } = await query
  let normalized = (data || []).map((post) => ({
    ...post,
    comment_count: post.comments?.[0]?.count ?? 0,
    reaction_count: post.post_reactions?.[0]?.count ?? 0,
  }))

  if (sort === 'popular') {
    normalized.sort((a, b) => (b.reaction_count + b.comment_count) - (a.reaction_count + a.comment_count))
    const total = normalized.length
    normalized = normalized.slice(from, to + 1)
    return { data: normalized, error, count: total }
  }

  return { data: normalized, error, count }
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

// Home 화면의 '루틴 챌린지 인증' 스토리 로우용 (사진이 있는 최신 인증 게시물)
export async function fetchChallengeStories(limit = 8) {
  const { data, error } = await supabase
    .from('posts')
    .select('id, title, image_url, created_at')
    .in('category', ['watering_proof', 'growth_proof'])
    .not('image_url', 'is', null)
    .order('created_at', { ascending: false })
    .limit(limit)
  return { data: data || [], error }
}

export async function fetchPostsByAuthor(authorId) {
  const { data, error } = await supabase
    .from('posts')
    .select('id, title, image_url, category, created_at')
    .eq('author_id', authorId)
    .order('created_at', { ascending: false })
  return { data, error }
}

// 매거진: 사진이 있는 게시물 중 반응+댓글 합산이 높은 순으로 노출
export async function fetchFeaturedPosts(limit = 12) {
  const { data, error } = await supabase
    .from('posts')
    .select('id, title, content, image_url, category, created_at, author:profiles(username), comments(count), post_reactions(count)')
    .not('image_url', 'is', null)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) return { data: [], error }

  const normalized = (data || []).map((post) => ({
    ...post,
    comment_count: post.comments?.[0]?.count ?? 0,
    reaction_count: post.post_reactions?.[0]?.count ?? 0,
  }))
  normalized.sort((a, b) => (b.reaction_count + b.comment_count) - (a.reaction_count + a.comment_count))
  return { data: normalized.slice(0, limit), error: null }
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
