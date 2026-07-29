import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import heroPhoto from '../assets/1.png'
import wateringPhoto from '../assets/화분에 물주기.jpg'
import neighborPhoto from '../assets/식물3.jpg'
import gradePhoto from '../assets/화분노트북.jpg'

const SLIDES = [
  { badge: '공지', title: '우리 일상의 식물 이야기, Green Thumb', subtitle: '매일 조금씩 자라나는 초록빛 순간들, 이웃 집사들과 함께 나눠보세요', image: heroPhoto },
  { badge: 'NEW', title: '오늘의 물주기, 잊지 않으셨나요?', subtitle: '마이 그린 도감에서 우리 집 식물 상태를 확인해보세요', image: wateringPhoto },
  { badge: 'PICK', title: '이웃 집사들의 방명록을 구경해보세요', subtitle: '초록 엄지 응원 도장도 눌러줄 수 있어요', image: neighborPhoto },
  {
    badge: '공지',
    title: '씨앗 집사 → 플랜트 마스터',
    subtitle: '식물을 키울수록 등급이 올라가요. 등급 기준이 궁금하다면?',
    to: '/grades',
    cta: '등급 안내 보기',
    image: gradePhoto,
  },
]

const AUTOPLAY_MS = 4000
const SWIPE_THRESHOLD = 40

export default function HeroBanner() {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const touchStartX = useRef(null)
  const slide = SLIDES[index]

  const goPrev = () => setIndex((i) => (i - 1 + SLIDES.length) % SLIDES.length)
  const goNext = () => setIndex((i) => (i + 1) % SLIDES.length)

  // 4초마다 자동 전환, 마우스 오버/터치 중에는 정지
  useEffect(() => {
    if (paused) return undefined
    const timer = setInterval(goNext, AUTOPLAY_MS)
    return () => clearInterval(timer)
  }, [paused, index])

  const handleTouchStart = (e) => {
    setPaused(true)
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e) => {
    const startX = touchStartX.current
    touchStartX.current = null
    setPaused(false)
    if (startX == null) return
    const deltaX = e.changedTouches[0].clientX - startX
    if (deltaX > SWIPE_THRESHOLD) goPrev()
    else if (deltaX < -SWIPE_THRESHOLD) goNext()
  }

  return (
    <div
      className="hero-banner hero-banner-photo"
      style={{ backgroundImage: `url(${slide.image})` }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="hero-banner-scrim" />
      <div className="hero-content">
        <div className="hero-slide-fade" key={index}>
          <span className="badge hero-badge">{slide.badge}</span>
          <h2 className="hero-title">{slide.title}</h2>
          <p className="hero-subtitle">{slide.subtitle}</p>
        </div>
        <div className="hero-dots">
          {SLIDES.map((s, i) => (
            <button
              key={s.title}
              className="hero-dot"
              data-active={i === index}
              aria-label={`슬라이드 ${i + 1}`}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      </div>
      {slide.to && (
        <Link to={slide.to} className="hero-cta">{slide.cta} →</Link>
      )}
    </div>
  )
}
