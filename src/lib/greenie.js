import { supabase } from './supabase'

export const MAX_LEVEL = 1000
export const TAP_EXP = 1
export const WATERING_EXP = 1000

// 레벨별 필요 터치 수 (구간별 난이도, 값 사이는 로그 스케일로 보간)
const EXP_ANCHORS = [
  [1, 1000], [2, 1150], [3, 1320], [4, 1510], [5, 1730],
  [10, 3200], [20, 7500], [30, 13500], [40, 21000], [50, 30000],
  [75, 75000], [100, 150000], [150, 450000], [200, 900000],
  [300, 2500000], [400, 5000000], [500, 8500000], [600, 13000000],
  [700, 19000000], [800, 26000000], [900, 34000000], [1000, 50000000],
]

export function requiredExp(level) {
  const lvl = Math.min(Math.max(level, 1), MAX_LEVEL)
  let lo = EXP_ANCHORS[0]
  let hi = EXP_ANCHORS[EXP_ANCHORS.length - 1]
  for (let i = 0; i < EXP_ANCHORS.length - 1; i += 1) {
    if (lvl >= EXP_ANCHORS[i][0] && lvl <= EXP_ANCHORS[i + 1][0]) {
      lo = EXP_ANCHORS[i]
      hi = EXP_ANCHORS[i + 1]
      break
    }
  }
  if (lo[0] === hi[0]) return lo[1]
  const t = (lvl - lo[0]) / (hi[0] - lo[0])
  const logVal = Math.log(lo[1]) + t * (Math.log(hi[1]) - Math.log(lo[1]))
  return Math.round(logVal ? Math.exp(logVal) : lo[1])
}

// 레벨/경험치에 exp를 더하고, 필요하면 여러 레벨을 한 번에 올린다 (물주기 보너스처럼 큰 값이 들어올 수 있어서)
export function applyExp(level, exp, amount) {
  let nextLevel = level
  let nextExp = exp + amount
  while (nextLevel < MAX_LEVEL && nextExp >= requiredExp(nextLevel)) {
    nextExp -= requiredExp(nextLevel)
    nextLevel += 1
  }
  if (nextLevel >= MAX_LEVEL) {
    nextLevel = MAX_LEVEL
    nextExp = 0
  }
  return { level: nextLevel, exp: nextExp }
}

export function growthStage(level) {
  if (level <= 100) return { name: '새싹 단계', emoji: '🌱' }
  if (level <= 300) return { name: '어린 식물', emoji: '🌿' }
  if (level <= 500) return { name: '성장기', emoji: '🍀' }
  if (level <= 700) return { name: '거목 단계', emoji: '🌳' }
  if (level <= 900) return { name: '신비한 식물', emoji: '🌸' }
  return { name: '전설의 그린이', emoji: '👑' }
}

export function greenieEmoji(level) {
  return growthStage(level).emoji
}

// 10레벨마다 모자 또는 악세사리를 번갈아 지급 (성장 단계별 테마)
const STAGE_ITEM_POOLS = [
  { max: 100, hats: ['🧢', '👒', '🎓', '🎩'], accessories: ['🎀', '🕶️', '🧣', '⭐'] },
  { max: 300, hats: ['🪖', '⛑️', '🧢', '👒'], accessories: ['🕶️', '🧣', '💍', '🎗️'] },
  { max: 500, hats: ['🎩', '🎓', '🪖', '👑'], accessories: ['💎', '📿', '🎗️', '🧣'] },
  { max: 700, hats: ['👑', '🎩', '⛑️', '🪖'], accessories: ['💎', '🌟', '🎗️', '📿'] },
  { max: 900, hats: ['👑', '🎓', '🪖', '🎩'], accessories: ['🌟', '💎', '✨', '📿'] },
  { max: 1000, hats: ['👑'], accessories: ['✨'] },
]

function poolFor(level) {
  return STAGE_ITEM_POOLS.find((s) => level <= s.max) || STAGE_ITEM_POOLS[STAGE_ITEM_POOLS.length - 1]
}

export const ITEM_MILESTONES = (() => {
  const items = []
  for (let lvl = 10; lvl <= MAX_LEVEL; lvl += 10) {
    const stage = growthStage(lvl)
    const pool = poolFor(lvl)
    const slot = (lvl / 10) % 2 === 0 ? 'accessory' : 'hat'
    const list = slot === 'hat' ? pool.hats : pool.accessories
    const idx = Math.floor((lvl - 10) / 10) % list.length
    items.push({
      level: lvl,
      slot,
      key: `${slot}_${lvl}`,
      emoji: list[idx],
      label: `${stage.name} ${slot === 'hat' ? '모자' : '악세사리'} (Lv.${lvl})`,
    })
  }
  return items
})()

export function unlockedItems(level, slot) {
  return ITEM_MILESTONES.filter((item) => item.slot === slot && item.level <= level)
}

export function findItem(key) {
  return ITEM_MILESTONES.find((item) => item.key === key) || null
}

export function nextLockedItem(level, slot) {
  return ITEM_MILESTONES.find((item) => item.slot === slot && item.level > level) || null
}

export async function fetchMyGreenie(userId) {
  const { data, error } = await supabase.from('greenies').select('*').eq('user_id', userId).maybeSingle()
  if (!error && !data) {
    const { data: created, error: insertError } = await supabase
      .from('greenies')
      .insert({ user_id: userId })
      .select()
      .single()
    return { data: created, error: insertError }
  }
  return { data, error }
}

// 다른 유저의 그린이를 읽기 전용으로 조회 (없으면 방문 불가로 처리, insert하지 않음)
export async function fetchGreenieByUserId(userId) {
  const { data, error } = await supabase
    .from('greenies')
    .select('*, profile:profiles(id, username)')
    .eq('user_id', userId)
    .maybeSingle()
  return { data, error }
}

export async function fetchGreenieLeaderboard(excludeUserId, limit = 30) {
  let query = supabase
    .from('greenies')
    .select('user_id, level, exp, equipped_hat, equipped_accessory, profile:profiles(id, username)')
    .order('level', { ascending: false })
    .order('exp', { ascending: false })
    .limit(limit)
  if (excludeUserId) query = query.neq('user_id', excludeUserId)
  const { data, error } = await query
  return { data: data || [], error }
}

export async function saveGreenie(userId, { level, exp }) {
  const { error } = await supabase
    .from('greenies')
    .update({ level, exp, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
  return { error }
}

export async function equipItem(userId, slot, itemKey) {
  const field = slot === 'hat' ? 'equipped_hat' : 'equipped_accessory'
  const { data, error } = await supabase
    .from('greenies')
    .update({ [field]: itemKey || null })
    .eq('user_id', userId)
    .select()
    .single()
  return { data, error }
}

// 물주기 체크 1회 = 터치 1000번과 동일한 경험치를 즉시 반영
export async function addGreenieExpFromWatering(userId) {
  const { data } = await fetchMyGreenie(userId)
  const current = data || { level: 1, exp: 0 }
  const next = applyExp(current.level, current.exp, WATERING_EXP)
  await saveGreenie(userId, next)
  return next
}
