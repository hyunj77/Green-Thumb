// '그린이' 화분 성장 단계(8단계)와 기분 상태(3종) 계산.
// 기존 레벨/경험치(1~1000) 시스템은 그대로 두고, 화면에 보여줄 성장 단계로만 재해석한다.
export const STAGES = [
  { key: 'seed', label: '씨앗', minLevel: 1, maxLevel: 10 },
  { key: 'sprout', label: '새싹', minLevel: 11, maxLevel: 50 },
  { key: 'sprout-leaf', label: '어린잎', minLevel: 51, maxLevel: 150 },
  { key: 'growth', label: '성장기', minLevel: 151, maxLevel: 300 },
  { key: 'bud', label: '꽃봉오리', minLevel: 301, maxLevel: 500 },
  { key: 'bloom', label: '개화', minLevel: 501, maxLevel: 700 },
  { key: 'fruit', label: '열매', minLevel: 701, maxLevel: 900 },
  { key: 'tree', label: '그린 트리', minLevel: 901, maxLevel: 1000 },
]

export function stageForLevel(level) {
  return STAGES.find((s) => level >= s.minLevel && level <= s.maxLevel) || STAGES[STAGES.length - 1]
}

export const MOODS = {
  vibrant: { key: 'vibrant', label: '생기 넘침' },
  normal: { key: 'normal', label: '보통' },
  thirsty: { key: 'thirsty', label: '목마름' },
}

// 최근 활동(updated_at) 기준: 3일 이내면 생기 넘침, 5일 이상이면 목마름. 페널티나 리셋은 없음(표정만 변화).
export function moodFromLastActive(updatedAt) {
  if (!updatedAt) return MOODS.normal
  const days = (Date.now() - new Date(updatedAt).getTime()) / 86400000
  if (days <= 3) return MOODS.vibrant
  if (days >= 5) return MOODS.thirsty
  return MOODS.normal
}
