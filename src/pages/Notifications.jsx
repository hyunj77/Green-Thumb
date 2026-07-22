import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MessageCircle, MessageSquare, Sprout } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { fetchMyNotifications, markNotificationRead, markAllNotificationsRead } from '../lib/notifications'
import { timeAgo } from '../lib/time'

const TYPE_META = {
  comment: { Icon: MessageCircle, label: '댓글' },
  reaction: { Icon: Sprout, label: '반응' },
  message: { Icon: MessageSquare, label: '쪽지' },
}

export default function Notifications() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    if (!user) return setLoading(false)
    setLoading(true)
    fetchMyNotifications(user.id).then(({ data }) => {
      setItems(data)
      setLoading(false)
    })
  }

  useEffect(load, [user])

  const handleClick = async (n) => {
    if (!n.is_read) {
      await markNotificationRead(n.id)
      setItems((prev) => prev.map((i) => (i.id === n.id ? { ...i, is_read: true } : i)))
    }
    if (n.type === 'message') navigate('/messages')
    else if (n.post_id) navigate(`/posts/${n.post_id}`)
  }

  const handleMarkAll = async () => {
    if (!user) return
    await markAllNotificationsRead(user.id)
    setItems((prev) => prev.map((i) => ({ ...i, is_read: true })))
  }

  if (!user) return <p className="muted" style={{ padding: 20 }}>알림을 보려면 <Link to="/login">로그인</Link>이 필요해요.</p>

  return (
    <div style={{ padding: '0 20px 60px', maxWidth: 560, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>🔔 내 소식</h2>
        {items.some((i) => !i.is_read) && (
          <button className="secondary" onClick={handleMarkAll}>모두 읽음</button>
        )}
      </div>

      {loading ? (
        <p className="muted">불러오는 중...</p>
      ) : items.length === 0 ? (
        <p className="muted">아직 알림이 없어요. 댓글이나 반응, 쪽지가 오면 여기에 표시돼요.</p>
      ) : (
        <div className="community-list">
          {items.map((n) => {
            const { Icon, label } = TYPE_META[n.type] || {}
            return (
              <div key={n.id} className="community-item" onClick={() => handleClick(n)} style={{ opacity: n.is_read ? 0.6 : 1 }}>
                <div className="community-item-main">
                  <div className="community-item-head">
                    <span className="avatar-circle">{Icon ? <Icon size={14} /> : '🔔'}</span>
                    <span style={{ fontWeight: 700, color: 'var(--text-h)' }}>{n.actor?.username || '알 수 없음'}</span>
                    <span className="muted">· {label} · {timeAgo(n.created_at)}</span>
                  </div>
                  <div className="community-item-text">{n.content_preview}</div>
                </div>
                {!n.is_read && <span className="icon-btn-dot" style={{ position: 'static', flexShrink: 0, marginTop: 4 }} />}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
