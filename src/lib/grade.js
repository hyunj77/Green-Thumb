import { PLANT_SPECIES } from './encyclopedia'

// 식물 난이도별 가중치 — 어려운 식물을 키울수록, 많이 키울수록 점수가 높아짐
const DIFFICULTY_WEIGHT = {
  '매우 쉬움': 1,
  '쉬움': 2,
  '중간': 4,
  '어려움': 8,
}
const DEFAULT_WEIGHT = 2

export function plantWeight(species) {
  if (!species) return DEFAULT_WEIGHT
  const match = PLANT_SPECIES.find((p) => species.includes(p.name) || p.name.includes(species))
  return match ? DIFFICULTY_WEIGHT[match.difficulty] ?? DEFAULT_WEIGHT : DEFAULT_WEIGHT
}

export function computeGardenScore(plants = []) {
  return plants.reduce((sum, plant) => sum + plantWeight(plant.species), 0)
}

export const GRADE_TIERS = [
  { min: 0, name: '씨앗 집사', emoji: '🌰' },
  { min: 5, name: '새싹 집사', emoji: '🌱' },
  { min: 15, name: '초록 집사', emoji: '🍀' },
  { min: 30, name: '정원사', emoji: '🌳' },
  { min: 60, name: '플랜트 마스터', emoji: '👑' },
]

export function getGrade(score) {
  let current = GRADE_TIERS[0]
  for (const tier of GRADE_TIERS) {
    if (score >= tier.min) current = tier
  }
  const next = GRADE_TIERS.find((t) => t.min > score)
  return {
    ...current,
    score,
    next: next ? { ...next, pointsToNext: next.min - score } : null,
  }
}
