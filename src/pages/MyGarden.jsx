import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Bell, Camera, Clapperboard, Droplets, Info, NotebookPen, Play, Plus, Sprout, Sun } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { fetchMyPlants, createPlant, waterPlant, fertilizePlant, updateWateringInterval, updatePlantPhoto, nextWateringDate, syncGardenScore, SAMPLE_PLANTS } from '../lib/plants'
import { fetchGrowthLogs, fetchPhotoCountsByPlantIds } from '../lib/growthLogs'
import { findSpeciesInfo } from '../lib/encyclopedia'
import { addGreenieExpFromWatering } from '../lib/greenie'
import { uploadImage } from '../lib/storage'
import GrowthDiary from '../components/GrowthDiary'
import GrowthTimelapse from '../components/GrowthTimelapse'
import AiFeaturePreview from '../components/AiFeaturePreview'
import WateringCalendar from '../components/WateringCalendar'
import ImageUploadField from '../components/ImageUploadField'
import SeasonalTipBanner from '../components/SeasonalTipBanner'
import SymptomGuide from '../components/SymptomGuide'
import { SkeletonList } from '../components/Skeleton'

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
  const [photoCounts, setPhotoCounts] = useState({})
  const [uploadingPhotoId, setUploadingPhotoId] = useState(null)
  const [photoUploadError, setPhotoUploadError] = useState(null)
  const [activeSlide, setActiveSlide] = useState(0)
  const sliderRef = useRef(null)
  const dragRef = useRef({ dragging: false, startX: 0, startScroll: 0 })

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

  // 등급 배지가 항상 최신 식물 구성을 반영하도록, 마이 그린 도감을 열 때마다 동기화
  useEffect(() => {
    if (user) syncGardenScore(user.id)
  }, [user])

  // 성장 타임랩스 카드에 표시할 사진 개수 뱃지를 한 번에 조회
  useEffect(() => {
    if (!user || plants.length === 0) { setPhotoCounts({}); return }
    fetchPhotoCountsByPlantIds(plants.map((p) => p.id)).then(setPhotoCounts)
  }, [user, plants])

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

  const handleFertilize = async (id) => {
    const { data } = await fertilizePlant(id)
    if (data) setPlants((prev) => prev.map((p) => (p.id === id ? data : p)))
  }

  const handleCardPhotoSelect = async (plant, file) => {
    if (!file || !user) return
    setUploadingPhotoId(plant.id)
    setPhotoUploadError(null)
    const { url, error } = await uploadImage('plants', user.id, file)
    if (error) {
      console.error('식물 사진 업로드 실패:', error)
      setPhotoUploadError({ plantId: plant.id, message: error.message || '업로드에 실패했어요.' })
    } else if (url) {
      const { data, error: updateError } = await updatePlantPhoto(plant.id, url)
      if (data) setPlants((prev) => prev.map((p) => (p.id === plant.id ? data : p)))
      if (updateError) {
        console.error('식물 사진 저장 실패:', updateError)
        setPhotoUploadError({ plantId: plant.id, message: updateError.message || '사진 저장에 실패했어요.' })
      }
    }
    setUploadingPhotoId(null)
  }

  const goToSlide = (i) => {
    const el = sliderRef.current
    if (!el || plants.length === 0) return
    const clamped = Math.max(0, Math.min(plants.length - 1, i))
    const maxScroll = el.scrollWidth - el.clientWidth
    el.scrollTo({ left: maxScroll * (clamped / Math.max(1, plants.length - 1)), behavior: 'smooth' })
  }

  const handleSliderScroll = () => {
    const el = sliderRef.current
    if (!el || plants.length <= 1) return
    const maxScroll = el.scrollWidth - el.clientWidth
    if (maxScroll <= 0) return
    const idx = Math.round((el.scrollLeft / maxScroll) * (plants.length - 1))
    setActiveSlide((prev) => (prev === idx ? prev : idx))
  }

  const handleTrackPointerDown = (e) => {
    if (e.pointerType !== 'mouse' || !sliderRef.current) return
    dragRef.current = { dragging: true, startX: e.clientX, startScroll: sliderRef.current.scrollLeft }
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const handleTrackPointerMove = (e) => {
    if (!dragRef.current.dragging || !sliderRef.current) return
    sliderRef.current.scrollLeft = dragRef.current.startScroll - (e.clientX - dragRef.current.startX)
  }
  const stopTrackDrag = () => { dragRef.current.dragging = false }

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
      <div id="new-plant" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, scrollMarginTop: 20 }}>
        <h2 className="gt-page-title">마이 그린 도감</h2>
        {!isGuest && (
          <button
            onClick={() => setShowForm((v) => !v)}
            aria-label="식물 추가하기"
            style={{ width: 40, height: 40, padding: 0, borderRadius: '50%', flexShrink: 0 }}
          >
            <Plus size={18} />
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
        <SeasonalTipBanner />

        {greenieToast && (
          <div className="card" style={{ padding: '10px 16px', background: 'var(--green-light)', border: 'none', textAlign: 'center', fontWeight: 700, color: 'var(--accent)' }}>
            {greenieToast}
          </div>
        )}

        {isGuest && (
          <div className="card" style={{ padding: '14px 16px', background: 'var(--oat)', border: 'none' }}>
            <span className="badge" style={{ marginBottom: 4 }}>예시 화면</span>
            <p className="gt-season-tip-text">
              지금 보시는 식물들은 샘플이에요. <Link to="/login">로그인</Link>하면 나만의 식물을 직접 기록할 수 있어요.
            </p>
          </div>
        )}
      </div>

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
        <SkeletonList count={1} variant="card" />
      ) : plants.length === 0 ? (
        <div className="empty-state">
          <Sprout size={28} />
          <p>등록된 식물이 없어요. 첫 반려식물을 등록해보세요!</p>
          <button style={{ marginTop: 4 }} onClick={() => setShowForm(true)}><Plus size={14} /> 식물 등록하기</button>
        </div>
      ) : (
        <div className="plant-slider-wrap">
          <div
            className="plant-slider-track"
            ref={sliderRef}
            onScroll={handleSliderScroll}
            onPointerDown={handleTrackPointerDown}
            onPointerMove={handleTrackPointerMove}
            onPointerUp={stopTrackDrag}
            onPointerLeave={stopTrackDrag}
          >
          {plants.map((plant, slideIndex) => {
            const next = nextWateringDate(plant)
            const dueSoon = next && next <= new Date()
            const info = findSpeciesInfo(plant.species)

            const today = new Date(); today.setHours(0, 0, 0, 0)
            let waterBadge = null
            if (next) {
              const nextDay = new Date(next); nextDay.setHours(0, 0, 0, 0)
              const diffDays = Math.round((nextDay - today) / 86400000)
              waterBadge = { due: diffDays <= 0, label: diffDays <= 0 ? 'D-Day' : `D-${diffDays}` }
            }
            const acquiredRaw = plant.acquired_date || plant.created_at
            const daysSince = acquiredRaw
              ? Math.max(0, Math.round((Date.now() - new Date(acquiredRaw).getTime()) / 86400000))
              : null

            return (
              <div key={plant.id} className="plant-card plant-slide" data-active={slideIndex === activeSlide}>
                <div className="plant-card-media">
                  {plant.photo_url ? (
                    <img src={plant.photo_url} alt="" />
                  ) : !isGuest ? (
                    <label className="plant-card-photo-cta">
                      <Camera size={22} />
                      <span>{uploadingPhotoId === plant.id ? '업로드 중...' : '사진 등록하기'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        disabled={uploadingPhotoId === plant.id}
                        onChange={(e) => { handleCardPhotoSelect(plant, e.target.files?.[0]); e.target.value = '' }}
                      />
                    </label>
                  ) : (
                    <div className="magazine-card-media-placeholder">🌿</div>
                  )}
                  {daysSince != null && <span className="plant-card-badge plant-card-badge-day">D+{daysSince}</span>}
                  {waterBadge && (
                    <span className="plant-card-badge plant-card-badge-water" data-due={waterBadge.due}>
                      {waterBadge.label}
                    </span>
                  )}
                </div>
                <div className="plant-card-body">
                  <div className="plant-card-title">{plant.name}</div>
                  {plant.species && <div className="plant-card-species">{plant.species}</div>}
                  <div className="plant-card-lastwater">
                    마지막 물주기: {plant.last_watered_at || '기록 없음'}
                    {dueSoon && <span className="error-text" style={{ fontSize: 12, marginLeft: 4 }}>💧 필요해요!</span>}
                  </div>
                  <div className="plant-card-lastwater">
                    마지막 영양제: {plant.last_fertilized_at || '기록 없음'}
                  </div>
                  {photoUploadError?.plantId === plant.id && (
                    <p className="error-text" style={{ fontSize: 12, margin: '6px 0 0' }}>
                      📷 {photoUploadError.message}
                    </p>
                  )}

                  <div className="plant-card-actions">
                    {!isGuest && (
                      <button className="plant-card-water-btn" onClick={() => handleWater(plant.id)}>
                        <Droplets size={14} /> 물주기 완료
                      </button>
                    )}
                    {!isGuest && (
                      <button className="secondary plant-card-icon-btn" onClick={() => handleFertilize(plant.id)} aria-label="영양제 줬어요">
                        <Sprout size={14} />
                      </button>
                    )}
                    {info && (
                      <button className="secondary plant-card-icon-btn" onClick={() => setTipId(tipId === plant.id ? null : plant.id)}>
                        <Info size={14} />
                      </button>
                    )}
                    {!isGuest && (
                      <>
                        <button className="secondary plant-card-icon-btn" onClick={() => openReminder(plant)}>
                          <Bell size={14} />
                        </button>
                        <button className="secondary plant-card-icon-btn" onClick={() => setExpandedId(expandedId === plant.id ? null : plant.id)}>
                          <NotebookPen size={14} />
                        </button>
                      </>
                    )}
                  </div>

                  {reminderId === plant.id && (
                    <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
                      <div className="contact-row-label" style={{ marginBottom: 8 }}><Bell size={13} style={{ verticalAlign: -2, marginRight: 4 }} />물주기 알림 설정</div>
                      <p className="muted" style={{ marginTop: 0, marginBottom: 10 }}>
                        마지막 물주기로부터 며칠마다 알려드릴지 정해주세요.
                      </p>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                        <input
                          type="number"
                          min={1}
                          value={reminderDraft}
                          onChange={(e) => setReminderDraft(e.target.value)}
                          style={{ width: 64, flexShrink: 0 }}
                        />
                        <span className="muted" style={{ whiteSpace: 'nowrap', flexShrink: 0 }}>일마다</span>
                        <button onClick={() => handleSaveReminder(plant.id)} disabled={savingReminder} style={{ marginLeft: 'auto', flexShrink: 0 }}>
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
                      <div className="contact-row-label" style={{ marginBottom: 8 }}><Sprout size={13} style={{ verticalAlign: -2, marginRight: 4 }} />성장일기</div>
                      <GrowthDiary plantId={plant.id} ownerId={plant.owner_id} currentUserId={user.id} plant={plant} />
                    </div>
                  )}
                </div>
              </div>
            )
          })}
          </div>
        </div>
      )}

      {!loading && plants.length > 1 && (
        <div className="plant-slider-pagination">
          <div className="plant-slider-dots">
            {plants.map((p, i) => (
              <button
                key={p.id}
                type="button"
                className="plant-slider-dot"
                data-active={i === activeSlide}
                onClick={() => goToSlide(i)}
                aria-label={`${i + 1}번째 식물`}
              />
            ))}
          </div>
          <span className="plant-slider-counter">{activeSlide + 1} / {plants.length}</span>
        </div>
      )}

      {!loading && plants.length > 0 && (
        <>
          <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '32px 0 24px' }} />
          <WateringCalendar plants={plants} />
        </>
      )}

      {!loading && plants.length > 0 && (
        <div className="gt-section">
          <div className="gt-section-head">
            <span className="gt-section-title"><Clapperboard size={16} style={{ verticalAlign: -3, marginRight: 5 }} />성장 타임랩스</span>
          </div>
          <div className="tl-thumb-scroll">
            {plants.map((plant) => {
              const days = plant.created_at
                ? Math.max(0, Math.round((Date.now() - new Date(plant.created_at).getTime()) / 86400000))
                : null
              const count = photoCounts[plant.id] || 0
              return (
                <button
                  key={plant.id}
                  type="button"
                  className="tl-thumb-card"
                  onClick={() => openTimelapse(plant)}
                >
                  <div className="tl-thumb-media">
                    {plant.photo_url ? (
                      <img src={plant.photo_url} alt="" />
                    ) : (
                      <div className="tl-thumb-placeholder">🌿</div>
                    )}
                    <span className="tl-thumb-play"><Play size={16} fill="#fff" /></span>
                    {count > 0 && <span className="tl-thumb-badge">{count}장</span>}
                  </div>
                  <div className="tl-thumb-body">
                    <div className="tl-thumb-title">{plant.name}</div>
                    <div className="tl-thumb-meta">
                      {days != null ? `D+${days}` : '타임랩스 보기'}{plant.species ? ` · ${plant.species}` : ''}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {timelapsePlant && (
        <GrowthTimelapse logs={timelapseLogs} plant={timelapsePlant} onClose={() => setTimelapsePlant(null)} />
      )}

      <SymptomGuide />

      <AiFeaturePreview />
    </div>
  )
}
