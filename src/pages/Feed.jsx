import { Link } from 'react-router-dom'
import { BookOpen, MessageSquare, Newspaper, Sprout, Store, User } from 'lucide-react'
import HeroBanner from '../components/HeroBanner'
import GuestbookSection from '../components/GuestbookSection'

const SHORTCUT_BANNERS = [
  { to: '/community', label: '커뮤니티', desc: '이웃 집사들과 소통하기', Icon: MessageSquare },
  { to: '/garden', label: '마이 그린 도감', desc: '내 식물 기록하기', Icon: Sprout },
  { to: '/market', label: '로컬 장터', desc: '나눔·거래 둘러보기', Icon: Store },
  { to: '/encyclopedia', label: '식물 도감', desc: '관리법 찾아보기', Icon: BookOpen },
  { to: '/magazine', label: '매거진', desc: '인기 스토리 모아보기', Icon: Newspaper },
  { to: '/mypage', label: '마이페이지', desc: '내 활동/등급 확인하기', Icon: User },
]

export default function Feed() {
  return (
    <div style={{ padding: '0 20px 60px', position: 'relative' }}>
      <HeroBanner />

      <div className="shortcut-banner-row" style={{ marginTop: 24 }}>
        {SHORTCUT_BANNERS.map(({ to, label, desc, Icon }) => (
          <Link key={to} to={to} className="shortcut-banner">
            <Icon size={20} />
            <div>
              <div className="shortcut-banner-label">{label}</div>
              <div className="muted" style={{ fontSize: 12 }}>{desc}</div>
            </div>
          </Link>
        ))}
      </div>

      <div className="home-lower">
        <GuestbookSection />
      </div>
    </div>
  )
}
