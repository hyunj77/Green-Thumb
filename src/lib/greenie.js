import { supabase } from './supabase'

export const MAX_LEVEL = 1000
export const TAP_EXP = 1
export const WATERING_EXP = 1000

export function requiredExp(level) {
  return 10 + level * 2
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

export async function saveGreenie(userId, { level, exp }) {
  const { error } = await supabase
    .from('greenies')
    .update({ level, exp, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
  return { error }
}

// 물주기 체크 1회 = 터치 1000번과 동일한 경험치를 즉시 반영
export async function addGreenieExpFromWatering(userId) {
  const { data } = await fetchMyGreenie(userId)
  const current = data || { level: 1, exp: 0 }
  const next = applyExp(current.level, current.exp, WATERING_EXP)
  await saveGreenie(userId, next)
  return next
}

export function greenieEmoji(level) {
  if (level >= 1000) return '👑'
  if (level >= 500) return '🌸'
  if (level >= 200) return '🌳'
  if (level >= 100) return '🪴'
  if (level >= 50) return '🍀'
  if (level >= 10) return '🌿'
  return '🌱'
}
