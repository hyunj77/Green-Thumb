// 한눈에식물 커뮤니티 구조를 참고한 6개 상위 탭. 각 탭은 posts.category 값들을 묶어서 가리킨다.
export const TOP_TABS = [
  { key: 'all', label: '전체' },
  { key: 'growth', label: '성장일지' },
  { key: 'daily', label: '일상', categories: ['diary', 'showoff', 'diy'] },
  { key: 'question', label: '질문', categories: ['question'] },
  { key: 'info', label: '식물정보', categories: ['tip', 'trivia'] },
  { key: 'challenge', label: '그린썸 루틴 챌린지', categories: ['challenge_notice', 'watering_proof', 'growth_proof'] },
]

export function findTab(key) {
  return TOP_TABS.find((t) => t.key === key) || null
}

export function normalizeGrowthLog(log) {
  return {
    kind: 'growth',
    id: `growth-${log.id}`,
    created_at: log.created_at,
    title: log.note || `${log.plant?.name || '식물'} 성장 기록`,
    image_url: log.photo_url,
    author: log.plant?.owner,
    plant: log.plant,
  }
}

export function normalizePost(post) {
  return { kind: 'post', ...post }
}
