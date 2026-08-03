import { useEffect, useMemo, useState } from 'react'
import { Camera, Clock3, Pause, Play, Share2 } from 'lucide-react'
import BackHeader from './BackHeader'
import { findSpeciesInfo } from '../lib/encyclopedia'

// AI 없이, 성장일기에 쌓인 실제 사진과 기록을 날짜순으로 모아 보여주는 성장 타임랩스 페이지.
export default function GrowthTimelapse({ logs, plant, onClose }) {
  const sortedLogs = useMemo(
    () => logs.slice().sort((a, b) => new Date(a.log_date) - new Date(b.log_date)),
    [logs],
  )
  const photos = useMemo(() => sortedLogs.filter((log) => log.photo_url), [sortedLogs])

  const [index, setIndex] = useState(Math.max(photos.length - 1, 0))
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    if (!playing || photos.length < 2) return undefined
    const timer = setInterval(() => setIndex((i) => (i + 1) % photos.length), 1400)
    return () => clearInterval(timer)
  }, [playing, photos.length])

  const plantName = plant?.name || '식물'
  const speciesInfo = plant?.species ? findSpeciesInfo(plant.species) : null

  const startDateRaw = plant?.acquired_date || plant?.created_at || sortedLogs[0]?.log_date
  const daysTogether = startDateRaw
    ? Math.max(0, Math.round((Date.now() - new Date(startDateRaw).getTime()) / 86400000))
    : null

  const heightLogs = sortedLogs.filter((log) => log.height_cm != null)
  const heightGrowth = heightLogs.length >= 2
    ? Math.round((heightLogs[heightLogs.length - 1].height_cm - heightLogs[0].height_cm) * 10) / 10
    : null

  const handleShare = async () => {
    const shareText = `${plantName} 성장 타임랩스 — Green Thumb에서 함께 키우고 있어요 🌿`
    if (navigator.share) {
      try { await navigator.share({ title: `${plantName} 성장 타임랩스`, text: shareText }) } catch { /* 사용자가 공유를 취소한 경우 */ }
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(shareText)
    }
  }

  const current = photos[index]

  return (
    <div className="timelapse-backdrop">
      <div className="timelapse-page">
        <BackHeader
          onBack={onClose}
          right={
            <button type="button" className="gt-pill-btn gt-pill-btn-ghost" onClick={handleShare} style={{ padding: '8px 16px' }}>
              <Share2 size={13} /> 공유하기
            </button>
          }
        />

        <div className="timelapse-hero">
          <div>
            <h2 className="timelapse-hero-title">{plantName} 성장 타임랩스 🌿</h2>
            <p className="timelapse-hero-sub">처음 만난 날부터 지금까지,<br />우리 {plantName}의 성장을 기록했어요.</p>
          </div>
          {current?.photo_url && <img src={current.photo_url} alt="" className="timelapse-hero-photo" />}
        </div>

        {photos.length === 0 ? (
          <div className="tl-card" style={{ textAlign: 'center', padding: '32px 20px' }}>
            <p style={{ fontSize: 28, margin: '0 0 8px' }}><Camera size={28} /></p>
            <p style={{ margin: 0, fontWeight: 700 }}>아직 사진이 있는 기록이 없어요</p>
            <p className="muted" style={{ marginTop: 6 }}>사진과 함께 성장 기록을 남기면 여기서 타임랩스로 볼 수 있어요.</p>
          </div>
        ) : (
          <>
            <div className="tl-card">
              <div className="tl-card-head"><Clock3 size={15} /> 성장 타임랩스</div>
              <div className="tl-scrub-row">
                <button
                  type="button"
                  className="tl-scrub-play"
                  onClick={() => setPlaying((p) => !p)}
                  disabled={photos.length < 2}
                  aria-label={playing ? '일시정지' : '재생'}
                >
                  {playing ? <Pause size={15} /> : <Play size={15} />}
                </button>
                <div className="tl-scrub-track">
                  {photos.map((photo, i) => (
                    <button
                      key={photo.id}
                      type="button"
                      className="tl-scrub-item"
                      onClick={() => { setPlaying(false); setIndex(i) }}
                    >
                      <img src={photo.photo_url} alt="" className="tl-scrub-thumb" data-active={i === index} />
                      <span className="tl-scrub-date" data-active={i === index}>
                        {i === photos.length - 1 ? '오늘' : new Date(photo.log_date).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' })}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="tl-stats">
              {daysTogether != null && (
                <div className="tl-stat">
                  <div className="tl-stat-label">🌿 함께한 기간</div>
                  <div className="tl-stat-value">{daysTogether}일</div>
                </div>
              )}
              <div className="tl-stat">
                <div className="tl-stat-label">📝 기록 횟수</div>
                <div className="tl-stat-value">{sortedLogs.length}회</div>
              </div>
              {heightGrowth != null && (
                <div className="tl-stat">
                  <div className="tl-stat-label">📏 키 성장</div>
                  <div className="tl-stat-value">{heightGrowth > 0 ? '+' : ''}{heightGrowth}cm</div>
                </div>
              )}
              <div className="tl-stat">
                <div className="tl-stat-label">📷 사진 기록</div>
                <div className="tl-stat-value">{photos.length}장</div>
              </div>
            </div>

            <div>
              <div className="tl-card-head">🗂️ 성장 기록</div>
              <div className="tl-records-strip">
                {photos.map((photo, i) => (
                  <button
                    key={photo.id}
                    type="button"
                    className="tl-record-card"
                    onClick={() => { setPlaying(false); setIndex(i) }}
                  >
                    <img src={photo.photo_url} alt="" className="tl-record-photo" data-active={i === index} />
                    <div className="tl-record-date">{i === photos.length - 1 ? '오늘' : new Date(photo.log_date).toLocaleDateString('ko-KR')}</div>
                    {photo.note && <div className="tl-record-note">{photo.note}</div>}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        <div className="tl-tip-card">
          <div style={{ fontWeight: 800, marginBottom: 6, color: 'var(--text-h)' }}>🌱 오늘의 한마디</div>
          {speciesInfo ? (
            <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6 }}>
              {plantName}는 {speciesInfo.light}을 좋아해요.<br />
              {speciesInfo.watering} (약 {speciesInfo.wateringDays}일 주기)을 잊지 마세요!
            </p>
          ) : (
            <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6 }}>
              꾸준한 기록이 최고의 선물이에요.<br />
              오늘도 {plantName}와 함께해주셔서 고마워요 💚
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
