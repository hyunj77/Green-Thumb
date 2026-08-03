import { useState } from 'react'
import { ChevronDown, Stethoscope } from 'lucide-react'
import { SYMPTOM_GUIDE } from '../lib/symptomGuide'

// AI 없이, 자주 겪는 증상을 눌러보면 원인/해결법이 펼쳐지는 정적 체크리스트.
export default function SymptomGuide() {
  const [openId, setOpenId] = useState(null)

  return (
    <section style={{ marginTop: 32 }}>
      <h3 className="gt-section-title" style={{ display: 'block', marginBottom: 8 }}>
        <Stethoscope size={15} style={{ verticalAlign: -2, marginRight: 4 }} />증상 체크리스트
      </h3>
      <p className="muted" style={{ marginBottom: 16 }}>
        어떤 증상이 보이는지 눌러보세요. 흔한 원인과 해결법을 정리했어요.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {SYMPTOM_GUIDE.map((item) => {
          const open = openId === item.id
          return (
            <div key={item.id} className="contact-card" style={{ padding: 0, overflow: 'hidden' }}>
              <button
                type="button"
                onClick={() => setOpenId(open ? null : item.id)}
                style={{
                  width: '100%', background: 'none', border: 'none', padding: '14px 16px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  fontWeight: 700, fontSize: 14, color: 'var(--text-h)', textAlign: 'left',
                }}
              >
                {item.symptom}
                <ChevronDown
                  size={16}
                  style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease', flexShrink: 0, marginLeft: 8 }}
                />
              </button>
              {open && (
                <div style={{ padding: '0 16px 16px' }}>
                  <div className="muted" style={{ fontWeight: 700, marginBottom: 4, fontSize: 12.5 }}>🔍 예상 원인</div>
                  <ul style={{ margin: '0 0 12px', paddingLeft: 18, fontSize: 13, lineHeight: 1.7 }}>
                    {item.causes.map((c) => <li key={c}>{c}</li>)}
                  </ul>
                  <div className="muted" style={{ fontWeight: 700, marginBottom: 4, fontSize: 12.5 }}>💡 해결 방법</div>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, lineHeight: 1.7 }}>
                    {item.solutions.map((s) => <li key={s}>{s}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
