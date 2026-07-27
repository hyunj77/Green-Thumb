import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Shirt, Users } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import GreenieCharacter from './GreenieCharacter'
import { fetchMyGreenie, saveGreenie, applyExp, requiredExp, TAP_EXP, MAX_LEVEL } from '../lib/greenie'
import { stageForLevel, moodFromLastActive } from '../lib/greenieStages'

export default function GreenieGame() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [greenie, setGreenie] = useState({ level: 1, exp: 0, equipped_hat: null, equipped_accessory: null })
  const [loading, setLoading] = useState(true)
  const [levelUpMsg, setLevelUpMsg] = useState('')
  const [levelUpSignal, setLevelUpSignal] = useState(0)
  const saveTimer = useRef(null)

  useEffect(() => {
    if (!user) {
      setGreenie({ level: 1, exp: 0 })
      setLoading(false)
      return
    }
    setLoading(true)
    fetchMyGreenie(user.id).then(({ data }) => {
      if (data) setGreenie(data)
      setLoading(false)
    })
  }, [user])

  const handleTap = () => {
    if (!user) return navigate('/login')
    setGreenie((prev) => {
      const next = applyExp(prev.level, prev.exp, TAP_EXP)
      if (next.level > prev.level) {
        setLevelUpMsg(`🎉 레벨 ${next.level}이 됐어요!`)
        setLevelUpSignal((s) => s + 1)
        setTimeout(() => setLevelUpMsg(''), 1800)
      }
      clearTimeout(saveTimer.current)
      saveTimer.current = setTimeout(() => saveGreenie(user.id, next), 700)
      return { ...prev, ...next }
    })
  }

  if (loading) return null

  const { level, exp, equipped_hat: hat, equipped_accessory: accessory, updated_at: updatedAt } = greenie
  const maxed = level >= MAX_LEVEL
  const progress = maxed ? 100 : Math.min(100, (exp / requiredExp(level)) * 100)
  const stage = stageForLevel(level)
  const mood = moodFromLastActive(updatedAt)

  return (
    <div className="gt-card gt-greenie-card">
      <GreenieCharacter
        level={level}
        mood={mood.key}
        hat={hat}
        accessory={accessory}
        size={220}
        interactive={!!user}
        onTap={handleTap}
        levelUpSignal={levelUpSignal}
      />

      <div className="gt-greenie-info">
        <Link to="/greenie-stages" className="gt-greenie-eyebrow gt-greenie-eyebrow-link">
          오늘의 그린이 · {stage.label} 단계 · {mood.label} →
        </Link>
        <div className="gt-greenie-level">Lv. {level} {maxed && '(MAX)'}</div>
        <div className="gt-greenie-track">
          <div className="gt-greenie-fill" style={{ width: `${progress}%` }} />
        </div>
        <div className="gt-greenie-sub">
          {maxed ? '최고 레벨에 도달했어요!' : `${exp.toLocaleString()} / ${requiredExp(level).toLocaleString()} exp`}
        </div>
        {levelUpMsg && <div className="greenie-levelup">{levelUpMsg}</div>}
        {user ? (
          <div style={{ display: 'flex', gap: 8, marginTop: 8, justifyContent: 'center' }}>
            <Link to="/greenie#closet" className="gt-pill-btn gt-pill-btn-ghost" style={{ fontSize: 12, padding: '8px 14px' }}>
              <Shirt size={13} /> 옷장
            </Link>
            <Link to="/greenie#visit" className="gt-pill-btn gt-pill-btn-ghost" style={{ fontSize: 12, padding: '8px 14px' }}>
              <Users size={13} /> 방문하기
            </Link>
          </div>
        ) : (
          <div className="gt-greenie-sub">로그인하면 그린이를 키울 수 있어요</div>
        )}
      </div>
    </div>
  )
}
