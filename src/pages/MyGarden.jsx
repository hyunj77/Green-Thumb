import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Bell, Clapperboard, Droplets, Info, NotebookPen, Plus, Sun, Trash2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { fetchMyPlants, createPlant, waterPlant, deletePlant, updateWateringInterval, nextWateringDate, SAMPLE_PLANTS } from '../lib/plants'
import { fetchGrowthLogs } from '../lib/growthLogs'
import { findSpeciesInfo } from '../lib/encyclopedia'
import { addGreenieExpFromWatering } from '../lib/greenie'
import GrowthDiary from '../components/GrowthDiary'
import GrowthTimelapse from '../components/GrowthTimelapse'
import AiFeaturePreview from '../components/AiFeaturePreview'
import WateringCalendar from '../components/WateringCalendar'
import ImageUploadField from '../components/ImageUploadField'

export default function MyGarden() {
  const { user } = useAuth()
  const location = useLocation()
  const isGuest = !user
  const [plants, setPlants] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [species, setSpecies] = useState('')
  const [photoUrl, setPhotoUrl] = useState('')
  const [interval, setInterval_] = useState(7)
  const [intervalTouched, setIntervalTouched] = useState(false)
  const [expandedId, setExpandedId] = useState(null)
  const [tipId, setTipId] = useState(null)
  const [reminderId, setReminderId] = useState(null)
  const [reminderDraft, setReminderDraft] = useState(7)
  const [savingReminder, setSavingReminder] = useState(false)
  const [greenieToast, setGreenieToast] = useState('')
  const [timelapsePlant, setTimelapsePlant] = useState(null)
  const [timelapseLogs, setTimelapseLogs] = useState([])

  const speciesInfo = findSpeciesInfo(species)

  const load = () => {
    if (!user) {
      setPlants(SAMPLE_PLANTS)
      setLoading(false)
      return
    }
    setLoading(true)
    fetchMyPlants(user.id).then(({ data }) => {
      setPlants(data || [])
      setLoading(false)
    })
  }

  useEffect(load, [user])

  // '+' 버튼 등 다른 화면에서 해시로 들어오면 등록 폼을 열거나 AI 미리보기로 스크롤한다
  useEffect(() => {
    if (location.hash === '#new-plant' && !isGuest) setShowForm(true)
    if (location.hash) {
      const el = document.querySelector(location.hash)
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [location.hash, isGuest])

  useEffect(() => {
    if (speciesInfo && !intervalTouched) setInterval_(speciesInfo.wateringDays)
  }, [speciesInfo, intervalTouched])

  const handleAdd = async (e) => {
    e.preventDefault()
    const { data } = await createPlant({ ownerId: user.id, name, species, photoUrl, wateringIntervalDays: Number(interval) })
    if (data) setPlants((prev) => [data, ...prev])
    setName(''); setSpecies(''); setPhotoUrl(''); setInterval_(7); setIntervalTouched(false); setShowForm(false)
  }

  const handleWater = async (id) => {
    const { data } = await waterPlant(id)
    if (data) setPlants((prev) => prev.map((p) => (p.id === id ? data : p)))
    const greenie = await addGreenieExpFromWatering(user.id)
    setGreenieToast(`🌱 그린이가 쑥쑥 자랐어요! (Lv.${greenie.level})`)
    setTimeout(() => setGreenieToast(''), 2500)
  }

  const handleDelete = async (id) => {
    if (!confirm('이 식물 기록을 삭제할까요?')) return
    await deletePlant(id)
    setPlants((prev) => prev.filter((p) => p.id !== id))
  }

  const openTimelapse = async (plant) => {
    const { data } = await fetchGrowthLogs(plant.id)
    setTimelapseLogs(data || [])
    setTimelapsePlant(plant)
  }

  const openReminder = (plant) => {
    setReminderId(reminderId === plant.id ? null : plant.id)
    setReminderDraft(plant.watering_interval_days || 7)
  }

  const handleSaveReminder = async (id) => {
    setSavingReminder(true)
    const { data } = await updateWateringInterval(id, Number(reminderDraft))
    if (data) setPlants((prev) => prev.map((p) => (p.id === id ? data : p)))
    setSavingReminder(false)
    setReminderId(null)
  }

  return (
    <div style={{ padding: '0 20px 40px' }}>
      <div id="new-plant" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, scrollMarginTop: 20 }}>
        <h2 className="gt-page-title">마이 그린 도감</h2>
        {!isGuest && (
          <button onClick={() => setShowForm((v) => !v)} style={{ padding: '8px 14px', fontSize: 13 }}>
            <Plus size={14} /> 식물 등록
          </button>
        )}
      </div>

      {greenieToast && (
        <div className="card" style={{ padding: '10px 16px', marginBottom: 16, background: 'var(--green-light)', border: 'none', textAlign: 'center', fontWeight: 700, color: 'var(--accent)' }}>
          {greenieToast}
        </div>
      )}

      {isGuest && (
        <div className="contact-card" style={{ marginBottom: 20 }}>
          <span className="badge">예시 화면</span>
          <p style={{ margin: '8px 0 0' }}>
            지금 보시는 식물들은 샘플이에요. <Link to="/login">로그인</Link>하면 나만의 식물을 직접 기록할 수 있어요.
          </p>
        </div>
      )}

      {!isGuest && showForm && (
        <form onSubmit={handleAdd} className="card" style={{ padding: 24, marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input type="text" placeholder="식물 이름 (예: 몽이)" value={name} onChange={(e) => setName(e.target.value)} required />
          <input type="text" placeholder="품종 (예: 몬스테라)" value={species} onChange={(e) => setSpecies(e.target.value)} />

          {speciesInfo ? (
            <div className="contact-card" style={{ padding: 14 }}>
              <div style={{ fontWeight: 700, color: 'var(--text-h)', marginBottom: 4 }}>{speciesInfo.emoji} {speciesInfo.name} 키우기 팁</div>
              <div className="muted"><Droplets size={12} style={{ verticalAlign: -1 }} /> {speciesInfo.watering} (약 {speciesInfo.wateringDays}일 주기)</div>
              <div className="muted"><Sun size={12} style={{ verticalAlign: -1 }} /> {speciesInfo.light}</div>
              <div className="muted">난이도 {speciesInfo.difficulty} · {speciesInfo.petSafe ? '반려동물 안전' : '반려동물 주의'}</div>
            </div>
          ) : species.trim() && (
            <p className="muted" style={{ fontSize: 12.5, margin: 0 }}>
              📖 도감에 없는 식물이에요 — 아래 물주기 주기를 직접 입력해서 등록할 수 있어요.
            </p>
          )}

          <ImageUploadField folder="plants" userId={user.id} value={photoUrl} onChange={setPhotoUrl} />
          <label className="muted">
            물주기 주기 (일){speciesInfo && !intervalTouched && ' — 품종 기준 자동 입력됨'}
            <input
              type="number"
              min={1}
              value={interval}
              onChange={(e) => { setInterval_(e.target.value); setIntervalTouched(true) }}
            />
          </label>
          <button type="submit">등록</button>
        </form>
      )}

      {loading ? (
        <p className="muted">불러오는 중...</p>
      ) : plants.length === 0 ? (
        <p className="muted">등록된 식물이 없어요. 첫 반려식물을 등록해보세요!</p>
      ) : (
        <div className="magazine-feed">
          {plants.map((plant) => {
            const next = nextWateringDate(plant)
            const dueSoon = next && next <= new Date()
            const info = findSpeciesInfo(plant.species)
            return (
              <div key={plant.id} className="magazine-card">
                <div className="magazine-card-media">
                  {plant.photo_url ? <img src={plant.photo_url} alt="" /> : <div className="magazine-card-media-placeholder">🌿</div>}
                </div>
                <div className="magazine-card-body">
                  <div className="magazine-card-title" style={{ marginTop: 0 }}>{plant.name}</div>
                  {plant.species && <div className="muted">{plant.species}</div>}
                  <div className="muted" style={{ marginTop: 6 }}>
                    마지막 물주기: {plant.last_watered_at || '기록 없음'}
                  </div>
                  {next && (
                    <div className={dueSoon ? 'error-text' : 'muted'}>
                      다음 물주기: {next.toLocaleDateString('ko-KR')} {dueSoon && '💧 필요해요!'}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
                    {!isGuest && (
                      <button onClick={() => handleWater(plant.id)} style={{ flex: 1, justifyContent: 'center', whiteSpace: 'nowrap', padding: '10px 8px' }}><Droplets size={14} /> 물 줬어요</button>
                    )}
                    {info && (
                      <button className="secondary" style={{ padding: '10px' }} onClick={() => setTipId(tipId === plant.id ? null : plant.id)}>
                        <Info size={14} />
                      </button>
                    )}
                    {!isGuest && (
                      <>
                        <button className="secondary" style={{ padding: '10px' }} onClick={() => openReminder(plant)}>
                          <Bell size={14} />
                        </button>
                        <button className="secondary" style={{ padding: '10px' }} onClick={() => setExpandedId(expandedId === plant.id ? null : plant.id)}>
                          <NotebookPen size={14} />
                        </button>
                        <button className="secondary" style={{ padding: '10px' }} onClick={() => handleDelete(plant.id)}><Trash2 size={14} /></button>
                      </>
                    )}
                  </div>

                  {reminderId === plant.id && (
                    <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
                      <div className="contact-row-label" style={{ marginBottom: 8 }}>🔔 물주기 알림 설정</div>
                      <p className="muted" style={{ marginTop: 0, marginBottom: 10 }}>
                        마지막 물주기로부터 며칠마다 알려드릴지 정해주세요.
                      </p>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <input
                          type="number"
                          min={1}
                          value={reminderDraft}
                          onChange={(e) => setReminderDraft(e.target.value)}
                          style={{ maxWidth: 90 }}
                        />
                        <span className="muted">일마다</span>
                        <button onClick={() => handleSaveReminder(plant.id)} disabled={savingReminder} style={{ marginLeft: 'auto' }}>
                          저장
                        </button>
                      </div>
                    </div>
                  )}

                  {tipId === plant.id && info && (
                    <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
                      <div className="contact-row-label" style={{ marginBottom: 8 }}>{info.emoji} 키우기 팁</div>
                      <div className="muted"><Droplets size={12} style={{ verticalAlign: -1 }} /> {info.watering} (약 {info.wateringDays}일 주기)</div>
                      <div className="muted"><Sun size={12} style={{ verticalAlign: -1 }} /> {info.light}</div>
                      <div className="muted">난이도 {info.difficulty} · {info.petSafe ? '반려동물 안전' : '반려동물 주의'}</div>
                    </div>
                  )}

                  {!isGuest && expandedId === plant.id && (
                    <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
                      <div className="contact-row-label" style={{ marginBottom: 8 }}>🌱 성장일기</div>
                      <GrowthDiary plantId={plant.id} ownerId={plant.owner_id} currentUserId={user.id} />
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {!loading && plants.length > 0 && <WateringCalendar plants={plants} />}

      {!loading && plants.length > 0 && (
        <div className="gt-section">
          <div className="gt-section-head">
            <span className="gt-section-title">🎬 성장 타임랩스</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {plants.map((plant) => (
              <button
                key={plant.id}
                type="button"
                className="secondary"
                style={{ justifyContent: 'flex-start' }}
                onClick={() => openTimelapse(plant)}
              >
                <Clapperboard size={14} /> {plant.name} 타임랩스 보기
              </button>
            ))}
          </div>
        </div>
      )}

      {timelapsePlant && (
        <GrowthTimelapse logs={timelapseLogs} onClose={() => setTimelapsePlant(null)} />
      )}

      <AiFeaturePreview />
    </div>
  )
}
