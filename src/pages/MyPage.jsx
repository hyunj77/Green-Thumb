import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Camera, MessageCircle, Sprout, FileText, ThumbsUp, Settings as SettingsIcon } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { fetchMyPosts, CATEGORY_LABEL } from '../lib/posts'
import { fetchMyStats } from '../lib/stats'
import { fetchMyBookmarks } from '../lib/bookmarks'
import { fetchMyPlants } from '../lib/plants'
import { computeGardenScore, getGrade } from '../lib/grade'
import { supabase } from '../lib/supabase'
import ActivityChart from '../components/ActivityChart'
import AvatarEditModal from '../components/AvatarEditModal'

export default function MyPage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [posts, setPosts] = useState([])
  const [stats, setStats] = useState(null)
  const [bookmarks, setBookmarks] = useState([])
  const [plants, setPlants] = useState([])
  const [editingAvatar, setEditingAvatar] = useState(false)

  useEffect(() => {
    if (!user) return
    supabase.from('profiles').select('*').eq('id', user.id).single().then(({ data }) => setProfile(data))
    fetchMyPosts(user.id).then(({ data }) => setPosts(data || []))
    fetchMyStats(user.id).then(setStats)
    fetchMyBookmarks(user.id).then(({ data }) => setBookmarks(data || []))
    fetchMyPlants(user.id).then(({ data }) => setPlants(data || []))
  }, [user])

  if (!user) return null

  const grade = getGrade(computeGardenScore(plants))

  const statItems = [
    { label: '게시물', value: stats?.postCount, Icon: FileText, bg: '#DFFBF1', fg: '#00966F' },
    { label: '등록 식물', value: stats?.plantCount, Icon: Sprout, bg: '#EEE9FC', fg: '#7C5CD1' },
    { label: '받은 반응', value: stats?.reactionCount, Icon: ThumbsUp, bg: '#FFF3D6', fg: '#b8860b' },
    { label: '받은 댓글', value: stats?.commentCount, Icon: MessageCircle, bg: '#E7EBFC', fg: '#4a5bc2' },
  ]

  return (
    <div style={{ padding: '0 20px 40px', maxWidth: 640, margin: '0 auto' }}>
      <div className="card" style={{ padding: '28px 32px', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt=""
                style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : (
              <span className="avatar-circle" style={{ width: 56, height: 56, fontSize: 20 }}>{profile?.username?.[0] || '?'}</span>
            )}
            <button
              type="button"
              onClick={() => setEditingAvatar(true)}
              aria-label="프로필 사진 변경"
              style={{
                position: 'absolute', bottom: -2, right: -2, width: 24, height: 24, borderRadius: '50%',
                background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '2px solid #fff', padding: 0,
              }}
            >
              <Camera size={12} />
            </button>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <h2 style={{ margin: 0 }}>{profile?.username || '...'}</h2>
              <span className="badge grade-badge">{grade.emoji} {grade.name}</span>
              <Link to="/grades" style={{ fontSize: 12 }}>등급 안내 →</Link>
            </div>
            <p className="muted" style={{ margin: '4px 0 0' }}>{user.email}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 14, marginTop: 10, flexWrap: 'wrap' }}>
          <Link to={`/users/${user.id}`} style={{ fontSize: 14 }}>공개 프로필 보기 →</Link>
          <Link to="/settings" style={{ fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 4 }}><SettingsIcon size={13} />계정 설정</Link>
        </div>
      </div>

      {editingAvatar && (
        <AvatarEditModal
          userId={user.id}
          currentUrl={profile?.avatar_url}
          onClose={() => setEditingAvatar(false)}
          onSaved={(nextUrl) => {
            setProfile((prev) => ({ ...prev, avatar_url: nextUrl }))
            setEditingAvatar(false)
          }}
        />
      )}

      <div className="stat-grid">
        {statItems.map(({ label, value, Icon, bg, fg }) => (
          <div key={label} className="stat-tile">
            <span className="stat-icon-badge" style={{ background: bg, color: fg }}>
              <Icon size={16} />
            </span>
            <div className="stat-tile-value">{value ?? '-'}</div>
            <div className="muted">{label}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: '24px 32px', marginBottom: 20 }}>
        <h3>최근 6주 활동</h3>
        <ActivityChart posts={posts} />
      </div>

      <div className="card" style={{ padding: '24px 32px', marginBottom: 20 }}>
        <h3>저장한 글</h3>
        {bookmarks.length === 0 ? (
          <p className="muted">저장한 게시물이 없어요. 마음에 드는 글을 저장해보세요!</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {bookmarks.map(({ id, post }) => post && (
              <Link key={id} to={`/posts/${post.id}`} style={{ color: 'inherit' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <span>{post.title}</span>
                  <span className="muted">{CATEGORY_LABEL[post.category] || post.category}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="card" style={{ padding: '24px 32px' }}>
        <h3>내가 쓴 글</h3>
        {posts.length === 0 ? (
          <p className="muted">작성한 게시물이 없어요.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {posts.map((post) => (
              <Link key={post.id} to={`/posts/${post.id}`} style={{ color: 'inherit' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <span>{post.title}</span>
                  <span className="muted">{new Date(post.created_at).toLocaleDateString('ko-KR')}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
