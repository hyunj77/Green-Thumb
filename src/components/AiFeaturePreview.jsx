import { Clapperboard, Sparkles, Stethoscope } from 'lucide-react'

const SAMPLES = [
  {
    Icon: Stethoscope,
    title: 'AI 병해충 진단',
    sample: '"잎 끝이 갈색으로 마르고 있어요" → 과습 가능성 78% · 해결법: 물주기 간격을 2일 늘려보세요',
  },
  {
    Icon: Sparkles,
    title: 'AI 성장 예측',
    sample: '현재 몬스테라 상태 기준 3개월 후 예상 키 68cm · 새잎 4~5장 예상',
  },
  {
    Icon: Clapperboard,
    title: '성장 타임랩스',
    sample: '지금까지 기록한 성장일기 사진을 이어붙여 자동으로 성장 영상을 만들어드려요',
  },
]

export default function AiFeaturePreview() {
  return (
    <section style={{ marginTop: 32 }}>
      <h3>✨ AI 스마트 기능 (준비중)</h3>
      <p className="muted" style={{ marginBottom: 16 }}>
        아래는 실제 동작하지 않는 예시 화면이에요. 외부 AI API 연동은 별도로 검토 중이에요.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
        {SAMPLES.map(({ Icon, title, sample }) => (
          <div key={title} className="contact-card" style={{ position: 'relative', padding: '18px 20px' }}>
            <span className="badge" style={{ position: 'absolute', top: 14, right: 14 }}>샘플</span>
            <Icon size={22} color="var(--accent)" />
            <div style={{ fontWeight: 700, color: 'var(--text-h)', margin: '10px 0 6px' }}>{title}</div>
            <p className="muted" style={{ margin: 0, lineHeight: 1.5 }}>{sample}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
