import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import GreenieCharacter from '../components/GreenieCharacter'
import { fetchGreenieByUserId, growthStage, MAX_LEVEL, requiredExp } from '../lib/greenie'

export default function GreenieVisit() {
  const { userId } = useParams()
  const { user } = useAuth()
  const [greenie, setGreenie] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetchGreenieByUserId(userId).then(({ data }) => {
      setGreenie(data)
      setLoading(false)
    })
  }, [userId])

  if (loading) return <p className="muted" style={{ padding: 20 }}>불러오는 중...</p>
  if (!greenie) return <p className="muted" style={{ padding: 20 }}>아직 그린이가 없는 집사예요.</p>

  const { level, exp, equipped_hat: hat, equipped_accessory: accessory, profile } = greenie
  const maxed = level >= MAX_LEVEL
  const progress = maxed ? 100 : Math.min(100, (exp / requiredExp(level)) * 100)
  const stage = growthStage(level)
  const isMine = user && user.id === userId

  return (
    <div style={{ padding: '0 20px 60px', maxWidth: 640, margin: '0 auto' }}>
      <div className="greenie-card" style={{ marginTop: 20 }}>
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

        {isMine && (
          <Link to="/greenie"><button className="secondary">내 그린이 키우러 가기 →</button></Link>
        )}
      </div>
    </div>
  )
}
