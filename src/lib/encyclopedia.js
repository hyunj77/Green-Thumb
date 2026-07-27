export const PLANT_SPECIES = [
  { name: '몬스테라', emoji: '🌿', type: '관엽식물', difficulty: '쉬움', watering: '흙이 마르면 듬뿍', wateringDays: 7, light: '밝은 간접광', petSafe: false },
  { name: '스투키', emoji: '🌵', type: '다육·선인장', difficulty: '매우 쉬움', watering: '2~3주에 한 번', wateringDays: 18, light: '강한 빛 선호', petSafe: false },
  { name: '필레아', emoji: '🍀', type: '다육·선인장', difficulty: '쉬움', watering: '흙 표면이 마르면', wateringDays: 5, light: '밝은 간접광', petSafe: true },
  { name: '산세베리아', emoji: '🌱', type: '공기정화', difficulty: '매우 쉬움', watering: '한 달에 한 번', wateringDays: 30, light: '어디서든 잘 자람', petSafe: false },
  { name: '홍콩야자', emoji: '🌳', type: '관엽식물', difficulty: '쉬움', watering: '흙이 마르면', wateringDays: 7, light: '밝은 간접광', petSafe: false },
  { name: '알보 몬스테라', emoji: '🌿', type: '관엽식물', difficulty: '어려움', watering: '흙이 반쯤 마르면', wateringDays: 10, light: '밝은 간접광 필수', petSafe: false },
  { name: '금전수', emoji: '🪙', type: '공기정화', difficulty: '쉬움', watering: '2주에 한 번', wateringDays: 14, light: '중간~밝은 빛', petSafe: false },
  { name: '테이블야자', emoji: '🌴', type: '나무', difficulty: '쉬움', watering: '흙이 마르면', wateringDays: 7, light: '반그늘 선호', petSafe: true },
  { name: '스킨답서스', emoji: '🍃', type: '공기정화', difficulty: '매우 쉬움', watering: '흙 표면이 마르면', wateringDays: 5, light: '반그늘도 OK', petSafe: false },
  { name: '올리브나무', emoji: '🫒', type: '나무', difficulty: '중간', watering: '흙이 완전히 마르면', wateringDays: 10, light: '직사광선 선호', petSafe: true },
  { name: '제라늄', emoji: '🌸', type: '꽃·개화식물', difficulty: '쉬움', watering: '흙이 마르면', wateringDays: 6, light: '밝은 직사광', petSafe: false },
  { name: '아프리칸바이올렛', emoji: '💜', type: '꽃·개화식물', difficulty: '중간', watering: '흙 표면이 마르면 (잎에 물 닿지 않게)', wateringDays: 5, light: '밝은 간접광', petSafe: true },
  { name: '바질', emoji: '🌿', type: '허브·식용', difficulty: '쉬움', watering: '흙이 살짝 마르면', wateringDays: 3, light: '밝은 직사광', petSafe: true },
  { name: '로즈마리', emoji: '🌱', type: '허브·식용', difficulty: '중간', watering: '흙이 완전히 마르면', wateringDays: 8, light: '강한 빛 선호', petSafe: true },
  { name: '립살리스', emoji: '🪴', type: '행잉식물', difficulty: '쉬움', watering: '흙이 마르면', wateringDays: 10, light: '밝은 간접광', petSafe: true },
  { name: '접란', emoji: '🌾', type: '행잉식물', difficulty: '매우 쉬움', watering: '흙 표면이 마르면', wateringDays: 6, light: '반그늘도 OK', petSafe: true },
]

export const DIFFICULTY_ORDER = ['매우 쉬움', '쉬움', '중간', '어려움']
export const PLANT_TYPES = ['관엽식물', '다육·선인장', '꽃·개화식물', '허브·식용', '행잉식물', '공기정화', '수경재배', '초보자용']

// 수경재배(물꽂이)로 잘 자라는 종 — 별도 type 필드 없이 이름으로 판별
const WATER_PROPAGATION_FRIENDLY = ['스킨답서스', '몬스테라', '필레아', '접란']

// '수경재배'/'초보자용'은 실제 식물 유형이 아니라 재배 방식·난이도 기준이라
// type 필드 대신 이 함수로 특별 취급해서 매칭한다.
export function matchesType(plant, type) {
  if (!type) return true
  if (type === '초보자용') return plant.difficulty === '매우 쉬움' || plant.difficulty === '쉬움'
  if (type === '수경재배') return WATER_PROPAGATION_FRIENDLY.includes(plant.name)
  return plant.type === type
}

export function findSpeciesInfo(species) {
  if (!species) return null
  const trimmed = species.trim()
  if (!trimmed) return null
  return PLANT_SPECIES.find((p) => trimmed.includes(p.name) || p.name.includes(trimmed)) || null
}
