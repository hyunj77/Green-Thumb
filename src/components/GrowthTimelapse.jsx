import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

// AI 없이, 성장일기에 쌓인 사진을 날짜순으로 이어붙여 슬라이드쇼처럼 보여준다.
export default function GrowthTimelapse({ logs, onClose }) {
  const photos = logs
    .filter((log) => log.photo_url)
    .slice()
    .sort((a, b) => new Date(a.log_date) - new Date(b.log_date))

  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(true)

  useEffect(() => {
    if (!playing || photos.length < 2) return undefined
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % photos.length)
    }, 1400)
    return () => clearInterval(timer)
  }, [playing, photos.length])

  if (photos.length === 0) return null
  const photo = photos[index]

  return (
    <div className="timelapse-backdrop" onClick={onClose}>
      <div className="timelapse-card" onClick={(e) => e.stopPropagation()}>
        <button className="timelapse-close" onClick={onClose} aria-label="닫기">
          <X size={18} />
        </button>
        <div className="timelapse-image-wrap">
          <img src={photo.photo_url} alt="" className="timelapse-image" />
          <div className="timelapse-date">{new Date(photo.log_date).toLocaleDateString('ko-KR')}{photo.height_cm ? ` · 키 ${photo.height_cm}cm` : ''}</div>
        </div>
        <div className="timelapse-controls">
          <button
            className="secondary"
            onClick={() => { setPlaying(false); setIndex((i) => (i - 1 + photos.length) % photos.length) }}
            aria-label="이전 사진"
          >
            <ChevronLeft size={16} />
          </button>
          <button onClick={() => setPlaying((p) => !p)} style={{ minWidth: 72 }}>
            {playing ? '일시정지' : '재생'}
          </button>
          <button
            className="secondary"
            onClick={() => { setPlaying(false); setIndex((i) => (i + 1) % photos.length) }}
            aria-label="다음 사진"
          >
            <ChevronRight size={16} />
          </button>
        </div>
        <div className="timelapse-progress">{index + 1} / {photos.length}</div>
      </div>
    </div>
  )
}
