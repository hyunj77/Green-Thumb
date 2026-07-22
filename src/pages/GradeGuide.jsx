import { GRADE_TIERS, DIFFICULTY_WEIGHT } from '../lib/grade'

export default function GradeGuide() {
  return (
    <div style={{ padding: '0 20px 60px', maxWidth: 640, margin: '0 auto' }}>
      <h2 style={{ marginTop: 20 }}>🏅 그린 썸 등급 안내</h2>
      <p className="muted" style={{ marginBottom: 24 }}>
        마이 그린 도감에 등록한 식물의 <strong>개수</strong>와 <strong>난이도</strong>를 합산한
        "그린 포인트"로 등급이 정해져요. 어려운 식물을 키우거나, 여러 식물을 함께 키울수록 포인트가 쌓여요.
      </p>

      <div className="card" style={{ padding: '24px 28px', marginBottom: 20 }}>
        <h3 style={{ marginTop: 0 }}>등급 단계</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {GRADE_TIERS.map((tier, i) => (
            <div key={tier.name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < GRADE_TIERS.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <span style={{ fontSize: 26 }}>{tier.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: 'var(--text-h)' }}>{tier.name}</div>
                <div className="muted">그린 포인트 {tier.min}점 이상</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ padding: '24px 28px' }}>
        <h3 style={{ marginTop: 0 }}>그린 포인트 계산법</h3>
        <p className="muted" style={{ marginTop: 0 }}>내 식물 각각의 난이도에 따라 아래 점수를 더해요.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {Object.entries(DIFFICULTY_WEIGHT).map(([level, weight]) => (
            <div key={level} style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>{level}</span>
              <span className="badge">{weight}점 / 식물 1개</span>
            </div>
          ))}
        </div>
        <p className="muted" style={{ marginTop: 14, marginBottom: 0 }}>
          식물 도감에 없는 품종은 기본 2점으로 계산돼요. 예를 들어 '어려움' 식물 2개 + '쉬움' 식물 1개를 키우면
          8+8+2 = 18점으로 🍀 초록 집사 등급이 돼요.
        </p>
      </div>
    </div>
  )
}
