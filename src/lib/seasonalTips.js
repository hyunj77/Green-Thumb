// 기온 API 없이, 현재 월을 기준으로 계절별 케어 팁을 매핑한다.
const SEASON_TIPS = [
  { key: 'spring', months: [3, 4, 5], emoji: '🌱', label: '봄', tip: '봄은 식물이 새순을 틔우는 성장기예요. 흙이 마르는 속도가 빨라지니 물주기 주기를 조금 당겨서 확인해보세요.' },
  { key: 'monsoon', months: [6, 7], emoji: '🌧️', label: '장마철', tip: '장마철엔 공기 중 습도가 높아 흙이 잘 마르지 않아요. 물주기 주기를 며칠 늘리고, 통풍에 신경 써주세요.' },
  { key: 'summer', months: [8], emoji: '☀️', label: '한여름', tip: '무더운 한여름엔 직사광선을 피하고 통풍이 잘 되는 곳에 두세요. 흙 표면이 마르면 아침저녁 선선할 때 물을 주는 게 좋아요.' },
  { key: 'autumn', months: [9, 10, 11], emoji: '🍂', label: '가을', tip: '가을은 성장이 느려지는 시기예요. 물주기 간격을 서서히 늘리고 비료는 줄여도 좋아요.' },
  { key: 'winter', months: [12, 1, 2], emoji: '❄️', label: '한겨울', tip: '겨울엔 흙이 마르는 속도가 느려져요. 물은 평소보다 적게 주고, 찬 바람이 직접 닿는 창가는 피해주세요.' },
]

export function getCurrentSeasonTip(date = new Date()) {
  const month = date.getMonth() + 1
  return SEASON_TIPS.find((s) => s.months.includes(month)) || SEASON_TIPS[0]
}
