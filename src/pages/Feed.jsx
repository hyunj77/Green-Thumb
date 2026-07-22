import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, MessageSquare, Sprout, Store } from 'lucide-react'
import HeroBanner from '../components/HeroBanner'
import { fetchPublicGrowthFeed } from '../lib/growthLogs'

const SHORTCUT_BANNERS = [
  { to: '/community', label: '커뮤니티', desc: '이웃 집사들과 소통하기', Icon: MessageSquare },
  { to: '/garden', label: '마이 그린 도감', desc: '내 식물 기록하기', Icon: Sprout },
  { to: '/market', label: '로컬 장터', desc: '나눔·거래 둘러보기', Icon: Store },
  { to: '/encyclopedia', label: '식물 도감', desc: '관리법 찾아보기', Icon: BookOpen },
]

export default function Feed() {
  const [logs, setLogs] = useState([])

  useEffect(() => {
    fetchPublicGrowthFeed(9).then(({ data }) => setLogs(data))
  }, [])

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
