import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { MessageCircle, Sprout, FileText, ThumbsUp } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { fetchMyPosts, CATEGORY_LABEL } from '../lib/posts'
import { fetchMyStats } from '../lib/stats'
import { fetchMyBookmarks } from '../lib/bookmarks'
import { fetchMyPlants } from '../lib/plants'
import { computeGardenScore, getGrade } from '../lib/grade'
import { supabase } from '../lib/supabase'
import ActivityChart from '../components/ActivityChart'

export default function MyPage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [posts, setPosts] = useState([])
  const [stats, setStats] = useState(null)
  const [bookmarks, setBookmarks] = useState([])
  const [plants, setPlants] = useState([])

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
    { label: '게시물', value: stats?.postCount, Icon: FileText },
    { label: '등록 식물', value: stats?.plantCount, Icon: Sprout },
    { label: '받은 반응', value: stats?.reactionCount, Icon: ThumbsUp },
    { label: '받은 댓글', value: stats?.commentCount, Icon: MessageCircle },
  ]

  return (
    <div style={{ padding: '0 20px 40px', maxWidth: 640, margin: '0 auto' }}>
      <div className="card" style={{ padding: '28px 32px', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <h2 style={{ margin: 0 }}>{profile?.username || '...'}</h2>
          <span className="badge grade-badge">{grade.emoji} {grade.name}</span>
        </div>
        <p className="muted">{user.email}</p>
        {grade.next && (
          <p className="muted" style={{ margin: '8px 0 0' }}>
            다음 등급 {grade.next.emoji} {grade.next.name}까지 {grade.next.pointsToNext}점 남았어요 (그린 포인트 {grade.score})
          </p>
        )}
        <Link to={`/users/${user.id}`} style={{ display: 'inline-block', marginTop: 10, fontSize: 14 }}>공개 프로필 보기 →</Link>
      </div>

      <div className="stat-grid">
        {statItems.map(({ label, value, Icon }) => (
          <div key={label} className="stat-tile">
            <Icon size={16} />
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
