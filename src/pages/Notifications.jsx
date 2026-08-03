import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Bell, Droplets, MessageCircle, MessageSquare, Sprout, UserPlus } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import BackHeader from '../components/BackHeader'
import { fetchMyNotifications, markNotificationRead, markAllNotificationsRead } from '../lib/notifications'
import { SkeletonList } from '../components/Skeleton'
import { timeAgo } from '../lib/time'

const FILTERS = [
  { key: 'all', label: '전체' },
  { key: 'comment', label: '댓글' },
  { key: 'reaction', label: '반응' },
  { key: 'message', label: '쪽지' },
  { key: 'watering', label: '물주기' },
  { key: 'follow', label: '팔로우' },
]

const TYPE_META = {
  comment: { Icon: MessageCircle, label: '댓글' },
  reaction: { Icon: Sprout, label: '반응' },
  message: { Icon: MessageSquare, label: '쪽지' },
  watering: { Icon: Droplets, label: '물주기 알림' },
  follow: { Icon: UserPlus, label: '팔로우' },
}

export default function Notifications() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

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
    else if (n.type === 'watering') navigate('/garden')
    else if (n.type === 'follow' && n.actor?.id) navigate(`/users/${n.actor.id}`)
    else if (n.post_id) navigate(`/posts/${n.post_id}`)
  }

  const handleMarkAll = async () => {
    if (!user) return
    await markAllNotificationsRead(user.id)
    setItems((prev) => prev.map((i) => ({ ...i, is_read: true })))
  }

  const filteredItems = filter === 'all' ? items : items.filter((i) => i.type === filter)

  if (!user) {
    return (
      <div style={{ padding: '0 20px 60px', maxWidth: 560, margin: '0 auto' }}>
        <BackHeader title={<><Bell size={18} style={{ verticalAlign: -3, marginRight: 6 }} />내 소식</>} />
        <p className="muted">알림을 보려면 <Link to="/login">로그인</Link>이 필요해요.</p>
      </div>
    )
  }

  return (
    <div style={{ padding: '0 20px 60px', maxWidth: 560, margin: '0 auto' }}>
      <BackHeader
        title={<><Bell size={18} style={{ verticalAlign: -3, marginRight: 6 }} />내 소식</>}
        right={items.some((i) => !i.is_read) && (
          <button className="secondary" onClick={handleMarkAll}>모두 읽음</button>
        )}
      />

      {!loading && items.length > 0 && (
        <div className="view-toggle notif-filter-row">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              className={filter === f.key ? 'view-toggle-active' : ''}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <SkeletonList count={4} />
      ) : items.length === 0 ? (
        <div className="empty-state">
          <Bell size={28} />
          <p>아직 알림이 없어요. 댓글이나 반응, 쪽지가 오면 여기에 표시돼요.</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <p className="muted" style={{ textAlign: 'center', padding: '20px 0' }}>이 유형의 알림이 없어요.</p>
      ) : (
        <div className="community-list">
          {filteredItems.map((n) => {
            const { Icon, label } = TYPE_META[n.type] || {}
            return (
              <div key={n.id} className="community-item" onClick={() => handleClick(n)} style={{ opacity: n.is_read ? 0.6 : 1 }}>
                <div className="community-item-main">
                  <div className="community-item-head">
                    <span className="avatar-circle">{Icon ? <Icon size={14} /> : '🔔'}</span>
                    <span style={{ fontWeight: 700, color: 'var(--text-h)' }}>
                      {n.type === 'watering' ? '그린 썸' : (n.actor?.username || '알 수 없음')}
                    </span>
                    <span className="muted">· {label} · {timeAgo(n.created_at)}</span>
                  </div>
                  <div className="community-item-text">
                    {n.content_preview || (n.type === 'follow' ? '나를 팔로우하기 시작했어요' : '')}
                  </div>
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
