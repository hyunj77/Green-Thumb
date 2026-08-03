import { useMemo, useRef, useState } from 'react'

function monthKey(dateStr) {
  const d = new Date(dateStr)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function monthLabel(key) {
  const [y, m] = key.split('-')
  return `${y}년 ${Number(m)}월`
}

// 성장일기 사진을 월별로 묶어서 두 시점을 드래그 슬라이더로 비교한다.
export default function GrowthBeforeAfter({ photos }) {
  const monthly = useMemo(() => {
    const map = new Map()
    photos.forEach((log) => {
      const key = monthKey(log.log_date)
      if (!map.has(key)) map.set(key, log)
    })
    return Array.from(map.entries())
      .map(([key, log]) => ({ key, log }))
      .sort((a, b) => a.key.localeCompare(b.key))
  }, [photos])

  const [beforeKey, setBeforeKey] = useState(monthly[0]?.key)
  const [afterKey, setAfterKey] = useState(monthly[monthly.length - 1]?.key)
  const [reveal, setReveal] = useState(50)
  const frameRef = useRef(null)
  const draggingRef = useRef(false)

  if (monthly.length < 2) return null

  const before = monthly.find((m) => m.key === beforeKey) || monthly[0]
  const after = monthly.find((m) => m.key === afterKey) || monthly[monthly.length - 1]

  const updateFromClientX = (clientX) => {
    const frame = frameRef.current
    if (!frame) return
    const rect = frame.getBoundingClientRect()
    const pct = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100))
    setReveal(pct)
  }

  const handlePointerDown = (e) => {
    draggingRef.current = true
    e.currentTarget.setPointerCapture(e.pointerId)
    updateFromClientX(e.clientX)
  }
  const handlePointerMove = (e) => {
    if (!draggingRef.current) return
    updateFromClientX(e.clientX)
  }
  const stopDragging = () => { draggingRef.current = false }

  return (
    <div className="tl-card">
      <div className="tl-card-head">🔀 Before & After 비교</div>
      <div className="tl-ba-selects">
        <select value={before.key} onChange={(e) => setBeforeKey(e.target.value)}>
          {monthly.map((m) => <option key={m.key} value={m.key}>이전 · {monthLabel(m.key)}</option>)}
        </select>
        <select value={after.key} onChange={(e) => setAfterKey(e.target.value)}>
          {monthly.map((m) => <option key={m.key} value={m.key}>이후 · {monthLabel(m.key)}</option>)}
        </select>
      </div>
      <div
        ref={frameRef}
        className="tl-ba-frame"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={stopDragging}
        onPointerLeave={stopDragging}
      >
        <img src={after.log.photo_url} alt="이후" className="tl-ba-image" draggable={false} />
        <img
          src={before.log.photo_url}
          alt="이전"
          className="tl-ba-image tl-ba-image-overlay"
          style={{ clipPath: `inset(0 ${100 - reveal}% 0 0)` }}
          draggable={false}
        />
        <div className="tl-ba-handle" style={{ left: `${reveal}%` }} />
        <span className="tl-ba-label tl-ba-label-before">{monthLabel(before.key)}</span>
        <span className="tl-ba-label tl-ba-label-after">{monthLabel(after.key)}</span>
      </div>
      <p className="muted" style={{ fontSize: 11.5, marginTop: 8, textAlign: 'center' }}>
        사진을 좌우로 드래그해서 비교해보세요
      </p>
    </div>
  )
}
