import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { RefreshCw } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import GreenieCharacter from '../components/GreenieCharacter'
import BackHeader from '../components/BackHeader'
import {
  applyExp,
  equipItem,
  fetchRandomGreenies,
  fetchMyGreenie,
  growthStage,
  MAX_LEVEL,
  requiredExp,
  saveGreenie,
  TAP_EXP,
  unlockedItems,
} from '../lib/greenie'

function ClosetRow({ title, slot, level, equippedKey, onEquip }) {
  const items = unlockedItems(level, slot)
  return (
    <div style={{ marginBottom: 18 }}>
      <div className="contact-row-label" style={{ marginBottom: 8 }}>{title}</div>
      <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
        <button
          type="button"
          className={`greenie-item-slot ${!equippedKey ? 'greenie-item-slot-active' : ''}`}
          onClick={() => onEquip(slot, null)}
        >
          <span style={{ fontSize: 22 }}>✋</span>
          <span className="muted" style={{ fontSize: 11 }}>없음</span>
        </button>
        {items.map((item) => (
          <button
            key={item.key}
            type="button"
            className={`greenie-item-slot ${equippedKey === item.key ? 'greenie-item-slot-active' : ''}`}
            onClick={() => onEquip(slot, item.key)}
          >
            <span style={{ fontSize: 22 }}>{item.emoji}</span>
            <span className="muted" style={{ fontSize: 11 }}>Lv.{item.level}</span>
          </button>
        ))}
        {items.length === 0 && <p className="muted" style={{ fontSize: 13 }}>레벨을 올리면 아이템이 열려요!</p>}
      </div>
    </div>
  )
}

export default function GreenieHome() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = searchParams.get('tab') === 'visit' ? 'visit' : 'me'
  const [greenie, setGreenie] = useState(null)
  const [loading, setLoading] = useState(true)
  const [levelUpMsg, setLevelUpMsg] = useState('')
  const [levelUpSignal, setLevelUpSignal] = useState(0)
  const [visitPool, setVisitPool] = useState([])
  const saveTimer = useRef(null)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    fetchMyGreenie(user.id).then(({ data }) => {
      setGreenie(data)
      setLoading(false)
    })
  }, [user, navigate])

  const rollVisitPool = () => {
    if (!user) return
    fetchRandomGreenies(user.id, 12).then(({ data }) => setVisitPool(data))
  }

  useEffect(() => {
    if (tab === 'visit') rollVisitPool()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, user])

  const handleTap = () => {
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

  const handleEquip = async (slot, itemKey) => {
    setGreenie((prev) => ({
      ...prev,
      equipped_hat: slot === 'hat' ? itemKey : prev.equipped_hat,
      equipped_accessory: slot === 'accessory' ? itemKey : prev.equipped_accessory,
    }))
    await equipItem(user.id, slot, itemKey)
  }

  if (!user) return null
  if (loading || !greenie) {
    return (
      <div style={{ padding: '0 20px 60px', maxWidth: 640, margin: '0 auto' }}>
        <BackHeader title="그린이" />
        <p className="muted">불러오는 중...</p>
      </div>
    )
  }

  const { level, exp, equipped_hat: hat, equipped_accessory: accessory } = greenie
  const maxed = level >= MAX_LEVEL
  const progress = maxed ? 100 : Math.min(100, (exp / requiredExp(level)) * 100)
  const stage = growthStage(level)

  return (
    <div style={{ padding: '0 20px 60px', maxWidth: 640, margin: '0 auto' }}>
      <BackHeader title="그린이" />

      <div className="view-toggle" style={{ marginTop: 4 }}>
        <button className={tab === 'me' ? 'view-toggle-active' : ''} onClick={() => setSearchParams({})}>
          🌱 내 그린이 · 옷장
        </button>
        <button className={tab === 'visit' ? 'view-toggle-active' : ''} onClick={() => setSearchParams({ tab: 'visit' })}>
          🌍 방문하기
        </button>
      </div>

      {tab === 'me' ? (
        <>
          <div className="greenie-card" style={{ marginTop: 4 }}>
            <span className="badge">{stage.emoji} {stage.name}</span>
            <GreenieCharacter
              level={level}
              hat={hat}
              accessory={accessory}
              size={180}
              interactive
              onTap={handleTap}
              levelUpSignal={levelUpSignal}
            />

            <div className="greenie-info">
              <div className="greenie-level">Lv. {level} {maxed && '(MAX)'}</div>
              <div className="greenie-progress-track">
                <div className="greenie-progress-fill" style={{ width: `${progress}%` }} />
              </div>
              <div className="muted" style={{ fontSize: 12 }}>
                {maxed ? '그린이가 최고 레벨에 도달했어요!' : `${exp.toLocaleString()} / ${requiredExp(level).toLocaleString()}`}
              </div>
            </div>
            {levelUpMsg && <div className="greenie-levelup">{levelUpMsg}</div>}
          </div>

          <div className="card" style={{ marginTop: 20, padding: '22px 24px' }}>
            <h3 style={{ marginBottom: 14 }}>👕 그린이 옷장</h3>
            <ClosetRow title="모자" slot="hat" level={level} equippedKey={hat} onEquip={handleEquip} />
            <ClosetRow title="악세사리" slot="accessory" level={level} equippedKey={accessory} onEquip={handleEquip} />
          </div>
        </>
      ) : (
        <div className="card" style={{ marginTop: 20, padding: '22px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h3 style={{ margin: 0 }}>🌍 다른 사람 그린이 방문하기</h3>
            <button type="button" className="secondary" style={{ padding: '7px 12px', fontSize: 12.5 }} onClick={rollVisitPool}>
              <RefreshCw size={13} /> 새로고침
            </button>
          </div>
          {visitPool.length === 0 ? (
            <p className="muted">아직 방문할 수 있는 그린이가 없어요.</p>
          ) : (
            <div className="greenie-visit-grid">
              {visitPool.map((g) => (
                <Link key={g.user_id} to={`/greenie/${g.user_id}`} className="greenie-visit-card">
                  <GreenieCharacter level={g.level} hat={g.equipped_hat} accessory={g.equipped_accessory} size={48} />
                  <div className="greenie-visit-name">{g.profile?.username || '이웃 집사'}</div>
                  <div className="muted" style={{ fontSize: 11 }}>Lv. {g.level}</div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
