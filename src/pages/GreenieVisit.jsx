import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Droplets, Heart } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import GreenieCharacter from '../components/GreenieCharacter'
import BackHeader from '../components/BackHeader'
import {
  fetchGreenieByUserId,
  fetchVisitStatus,
  growthStage,
  MAX_LEVEL,
  petOthersGreenie,
  requiredExp,
  waterOthersGreenie,
} from '../lib/greenie'

export default function GreenieVisit() {
  const { userId } = useParams()
  const { user } = useAuth()
  const [greenie, setGreenie] = useState(null)
  const [loading, setLoading] = useState(true)
  const [visitStatus, setVisitStatus] = useState({ watered: false, petted: false })
  const [interacting, setInteracting] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => {
    setLoading(true)
    fetchGreenieByUserId(userId).then(({ data }) => {
      setGreenie(data)
      setLoading(false)
    })
    if (user && user.id !== userId) {
      fetchVisitStatus(user.id, userId).then(setVisitStatus)
    }
  }, [userId, user])

  const handleInteract = async (kind) => {
    if (!user || interacting) return
    setInteracting(true)
    const action = kind === 'water' ? waterOthersGreenie : petOthersGreenie
    const { done, greenie: updated } = await action(user.id, userId)
    if (done) {
      setGreenie((prev) => ({ ...prev, ...updated }))
      setVisitStatus((prev) => ({ ...prev, [kind === 'water' ? 'watered' : 'petted']: true }))
      setToast(kind === 'water' ? '💧 물을 줬어요!' : '🤗 쓰다듬어줬어요!')
      setTimeout(() => setToast(''), 1800)
    }
    setInteracting(false)
  }

  if (loading) {
    return (
      <div style={{ padding: '0 20px 60px', maxWidth: 640, margin: '0 auto' }}>
        <BackHeader title="그린이 방문" />
        <p className="muted">불러오는 중...</p>
      </div>
    )
  }
  if (!greenie) {
    return (
      <div style={{ padding: '0 20px 60px', maxWidth: 640, margin: '0 auto' }}>
        <BackHeader title="그린이 방문" />
        <p className="muted">아직 그린이가 없는 집사예요.</p>
      </div>
    )
  }

  const { level, exp, equipped_hat: hat, equipped_accessory: accessory, profile } = greenie
  const maxed = level >= MAX_LEVEL
  const progress = maxed ? 100 : Math.min(100, (exp / requiredExp(level)) * 100)
  const stage = growthStage(level)
  const isMine = user && user.id === userId

  return (
    <div style={{ padding: '0 20px 60px', maxWidth: 640, margin: '0 auto' }}>
      <BackHeader title="그린이 방문" />
      <div className="greenie-card" style={{ marginTop: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="badge">{stage.emoji} {stage.name}</span>
          <Link to={`/users/${userId}`} style={{ fontSize: 13, fontWeight: 700 }}>
            {profile?.username || '이웃 집사'}님의 그린이
          </Link>
        </div>

        <GreenieCharacter level={level} hat={hat} accessory={accessory} size={150} />

        <div className="greenie-info">
          <div className="greenie-level">Lv. {level} {maxed && '(MAX)'}</div>
          <div className="greenie-progress-track">
            <div className="greenie-progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {isMine ? (
          <Link to="/greenie"><button className="secondary">내 그린이 키우러 가기 →</button></Link>
        ) : user ? (
          <div className="greenie-visit-actions">
            <button className={visitStatus.watered ? 'secondary' : ''} disabled={visitStatus.watered || interacting} onClick={() => handleInteract('water')}>
              <Droplets size={14} /> {visitStatus.watered ? '오늘 물 줬어요' : '물 주기'}
            </button>
            <button className={visitStatus.petted ? 'secondary' : ''} disabled={visitStatus.petted || interacting} onClick={() => handleInteract('pet')}>
              <Heart size={14} /> {visitStatus.petted ? '오늘 쓰다듬었어요' : '쓰다듬기'}
            </button>
          </div>
        ) : (
          <p className="muted" style={{ marginTop: 12 }}>
            <Link to="/login">로그인</Link>하면 이 그린이에게 물을 주거나 쓰다듬을 수 있어요.
          </p>
        )}
        {toast && (
          <div className="card" style={{ padding: '8px 14px', marginTop: 12, background: 'var(--green-light)', border: 'none', textAlign: 'center', fontWeight: 700, color: 'var(--accent)' }}>
            {toast}
          </div>
        )}
      </div>
    </div>
  )
}
