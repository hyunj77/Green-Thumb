import { useState } from 'react'
import { Link } from 'react-router-dom'
import heroPhoto from '../assets/1.png'

const SLIDES = [
  { badge: '공지', title: '우리 일상의 식물 이야기, Green Thumb', subtitle: '매일 조금씩 자라나는 초록빛 순간들, 이웃 집사들과 함께 나눠보세요' },
  { badge: 'NEW', title: '오늘의 물주기, 잊지 않으셨나요?', subtitle: '마이 그린 도감에서 우리 집 식물 상태를 확인해보세요' },
  { badge: 'PICK', title: '이웃 집사들의 방명록을 구경해보세요', subtitle: '초록 엄지 응원 도장도 눌러줄 수 있어요' },
  {
    badge: '공지',
    title: '🌰 씨앗 집사부터 👑 플랜트 마스터까지',
    subtitle: '식물을 키울수록 등급이 올라가요. 등급 기준이 궁금하다면?',
    to: '/grades',
    cta: '등급 안내 보기',
  },
]

export default function HeroBanner({ backgroundImage = heroPhoto }) {
  const [index, setIndex] = useState(0)
  const slide = SLIDES[index]

  return (
    <div
      className={`hero-banner ${backgroundImage ? 'hero-banner-photo' : ''}`}
      style={backgroundImage ? { backgroundImage: `url(${backgroundImage})` } : undefined}
    >
      {backgroundImage && <div className="hero-banner-scrim" />}
      <span className="badge hero-badge">{slide.badge}</span>
      <h2 className="hero-title">{slide.title}</h2>
      <p className="hero-subtitle">{slide.subtitle}</p>
      {slide.to && (
        <Link to={slide.to} className="hero-cta">{slide.cta} →</Link>
      )}
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
  )
}
