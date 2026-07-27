import BackHeader from '../components/BackHeader'
import GreenieCharacter from '../components/GreenieCharacter'
import { STAGES } from '../lib/greenieStages'

const SAMPLE_LEVELS = { seed: 1, sprout: 25, leaves: 120, growth: 350, bloom: 750 }

const STAGE_DESC = {
  seed: '아직 흙 속에 잠들어 있어요. 첫 물주기를 시작하면 곧 싹이 터요.',
  sprout: '작은 새싹이 얼굴을 내밀었어요. 표정이 생기기 시작해요.',
  leaves: '잎이 한 쌍 자라나요. 그린이가 조금씩 자리를 잡아가요.',
  growth: '잎이 풍성해지고 꽃봉오리가 맺혀요. 곧 개화를 앞두고 있어요.',
  bloom: '활짝 피었어요! 그린이의 가장 화려한 완성 모습이에요.',
}

const MOOD_SAMPLES = [
  { key: 'vibrant', label: '생기 넘침', desc: '최근 3일 안에 활동이 있었어요' },
  { key: 'normal', label: '보통', desc: '평소와 같은 상태예요' },
  { key: 'thirsty', label: '목마름', desc: '5일 이상 활동이 없었어요 (표정만 변할 뿐 불이익은 없어요)' },
]

export default function GreenieStagesGuide() {
  return (
    <div style={{ padding: '0 20px 60px' }}>
      <BackHeader title="그린이 성장 단계" />

      <p className="muted" style={{ marginBottom: 24 }}>
        그린이는 실제 마이가든(내 식물 기록)과는 별개로, 앱을 꾸준히 쓸수록 자라나는 성장형 마스코트예요.
        물주기 체크, 커뮤니티 활동, 연속 접속처럼 꾸준한 활동이 쌓이면 다음 단계로 넘어가요.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {STAGES.map((stage) => (
          <div key={stage.key} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '18px 20px' }}>
            <GreenieCharacter level={SAMPLE_LEVELS[stage.key]} size={64} />
            <div>
              <div style={{ fontWeight: 800, color: 'var(--text-h)', fontSize: 15 }}>{stage.label}</div>
              <div className="muted" style={{ fontSize: 12, margin: '2px 0 6px' }}>
                Lv.{stage.minLevel}{stage.maxLevel > stage.minLevel ? `~${stage.maxLevel}` : ''}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text)' }}>{STAGE_DESC[stage.key]}</div>
            </div>
          </div>
        ))}
      </div>

      <h3 style={{ marginTop: 32 }}>기분 상태</h3>
      <p className="muted" style={{ marginBottom: 16 }}>
        최근 활동 여부에 따라 표정이 살짝 바뀌어요. 페널티나 리셋은 없으니 부담 없이 천천히 키워보세요.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {MOOD_SAMPLES.map((m) => (
          <div key={m.key} className="card" style={{ textAlign: 'center', padding: '16px 10px' }}>
            <GreenieCharacter level={SAMPLE_LEVELS.growth} mood={m.key} size={56} />
            <div style={{ fontWeight: 700, fontSize: 13, marginTop: 6 }}>{m.label}</div>
            <div className="muted" style={{ fontSize: 11, marginTop: 4 }}>{m.desc}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
