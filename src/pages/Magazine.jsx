import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchPublicGrowthFeed } from '../lib/growthLogs'

export default function Magazine() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPublicGrowthFeed(24).then(({ data }) => {
      setLogs(data)
      setLoading(false)
    })
  }, [])

  return (
    <div style={{ padding: '0 20px 60px' }}>
      <h2 style={{ marginTop: 20 }}>📷 매거진</h2>
      <p className="muted" style={{ marginBottom: 20 }}>마이 그린 도감에 올라온 이웃 집사들의 성장 기록 사진을 모았어요</p>

      {loading ? (
        <p className="muted">불러오는 중...</p>
      ) : logs.length === 0 ? (
        <p className="muted">아직 성장 기록 사진이 없어요. 마이 그린 도감에서 성장일기에 사진을 남겨보세요!</p>
      ) : (
        <div className="magazine-overlay-feed">
          {logs.map((log) => (
            <Link key={log.id} to={`/users/${log.plant?.owner?.id}`} className="magazine-overlay-card">
              <img src={log.photo_url} alt="" />
              <div className="magazine-overlay-scrim" />
              <div className="magazine-overlay-content">
                <span className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}>
                  🌿 {log.plant?.name || '식물'}
                </span>
                <div className="magazine-overlay-title">{log.note || '오늘의 성장 기록'}</div>
                <div className="magazine-overlay-meta">
                  <span>{log.plant?.owner?.username || '알 수 없음'}</span>
                  <span>· {new Date(log.log_date).toLocaleDateString('ko-KR')}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
