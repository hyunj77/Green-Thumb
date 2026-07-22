import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, ChevronRight, MessageSquare, Sprout, Store } from 'lucide-react'
import HeroBanner from '../components/HeroBanner'
import GreenieGame from '../components/GreenieGame'
import { fetchPublicGrowthFeed } from '../lib/growthLogs'

const SHORTCUT_BANNERS = [
  { to: '/community', label: '커뮤니티', desc: '이웃 집사들과 소통하기', Icon: MessageSquare, bg: '#DFFBF1', fg: '#00966F' },
  { to: '/garden', label: '마이 그린 도감', desc: '내 식물 기록하기', Icon: Sprout, bg: '#EEE9FC', fg: '#7C5CD1' },
  { to: '/market', label: '로컬 장터', desc: '나눔·거래 둘러보기', Icon: Store, bg: '#FFF3D6', fg: '#B8860B' },
  { to: '/encyclopedia', label: '식물 도감', desc: '관리법 찾아보기', Icon: BookOpen, bg: '#E7EBFC', fg: '#4A5BC2' },
]

export default function Feed() {
  const [logs, setLogs] = useState([])

  useEffect(() => {
    fetchPublicGrowthFeed(9).then(({ data }) => setLogs(data))
  }, [])

  return (
    <div style={{ padding: '0 20px 60px', position: 'relative' }}>
      <HeroBanner />

      <GreenieGame />

      <div className="shortcut-banner-row">
        {SHORTCUT_BANNERS.map(({ to, label, desc, Icon, bg, fg }) => (
          <Link key={to} to={to} className="shortcut-banner">
            <span className="shortcut-banner-icon" style={{ background: bg, color: fg }}>
              <Icon size={18} />
            </span>
            <div>
              <div className="shortcut-banner-label">{label}</div>
              <div className="muted" style={{ fontSize: 12 }}>{desc}</div>
            </div>
            <ChevronRight size={16} className="shortcut-banner-arrow" />
          </Link>
        ))}
      </div>

      {logs.length > 0 && (
        <div className="home-lower">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ margin: 0 }}>📷 매거진 피드</h3>
            <Link to="/magazine" style={{ fontSize: 14 }}>더보기 →</Link>
          </div>
          <div className="ig-grid">
            {logs.map((log) => (
              <Link key={log.id} to={`/users/${log.plant?.owner?.id}`} className="ig-grid-item">
                {log.photo_url ? <img src={log.photo_url} alt="" /> : <div className="ig-grid-placeholder">🌿</div>}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
