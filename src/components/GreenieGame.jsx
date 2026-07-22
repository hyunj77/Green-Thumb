import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { fetchMyGreenie, saveGreenie, applyExp, requiredExp, greenieEmoji, TAP_EXP, MAX_LEVEL } from '../lib/greenie'

export default function GreenieGame() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [greenie, setGreenie] = useState({ level: 1, exp: 0 })
  const [loading, setLoading] = useState(true)
  const [bump, setBump] = useState(false)
  const [levelUpMsg, setLevelUpMsg] = useState('')
  const saveTimer = useRef(null)

  useEffect(() => {
    if (!user) {
      setGreenie({ level: 1, exp: 0 })
      setLoading(false)
      return
    }
    setLoading(true)
    fetchMyGreenie(user.id).then(({ data }) => {
      if (data) setGreenie({ level: data.level, exp: data.exp })
      setLoading(false)
    })
  }, [user])

  const handleTap = () => {
    if (!user) return navigate('/login')
    setGreenie((prev) => {
      const next = applyExp(prev.level, prev.exp, TAP_EXP)
      if (next.level > prev.level) {
        setLevelUpMsg(`🎉 레벨 ${next.level}이 됐어요!`)
        setTimeout(() => setLevelUpMsg(''), 1800)
      }
      clearTimeout(saveTimer.current)
      saveTimer.current = setTimeout(() => saveGreenie(user.id, next), 700)
      return next
    })
    setBump(true)
    setTimeout(() => setBump(false), 150)
  }

  if (loading) return null

  const { level, exp } = greenie
  const maxed = level >= MAX_LEVEL
  const progress = maxed ? 100 : Math.min(100, (exp / requiredExp(level)) * 100)

  return (
    <div className="greenie-card">
      <div className="greenie-info">
        <div className="greenie-level">Lv. {level} {maxed && '(MAX)'}</div>
        <div className="greenie-progress-track">
          <div className="greenie-progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <div className="muted" style={{ fontSize: 12 }}>
          {maxed ? '그린이가 최고 레벨에 도달했어요!' : `${exp} / ${requiredExp(level)}`}
        </div>
      </div>

      <button type="button" className={`greenie-tap ${bump ? 'greenie-bump' : ''}`} onClick={handleTap} aria-label="그린이 터치해서 키우기">
        {greenieEmoji(level)}
      </button>

      <div style={{ textAlign: 'center' }}>
        <div style={{ fontWeight: 700, color: 'var(--text-h)' }}>그린이 키우기 🌱</div>
        <div className="muted" style={{ fontSize: 12 }}>
          {user ? '터치할수록 자라요! 물주기 체크하면 왕창 성장해요' : '로그인하면 그린이를 키울 수 있어요'}
        </div>
        {levelUpMsg && <div className="greenie-levelup">{levelUpMsg}</div>}
      </div>
    </div>
  )
}
