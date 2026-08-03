import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { Camera, Image, MapPin, MessageSquare, Sprout, ThumbsUp } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import BackHeader from '../components/BackHeader'
import AvatarEditModal from '../components/AvatarEditModal'
import { fetchPostsByAuthor, CATEGORY_LABEL } from '../lib/posts'
import { fetchMyPlants } from '../lib/plants'
import { fetchGrowthLogsByAuthor } from '../lib/growthLogs'
import { fetchStampInfo, toggleStamp } from '../lib/guestbook'
import { computeGardenScore, getGrade } from '../lib/grade'

export default function UserProfile() {
  const { id } = useParams()
  const { user } = useAuth()
  const location = useLocation()
  const [profile, setProfile] = useState(null)
  const [posts, setPosts] = useState([])
  const [plants, setPlants] = useState([])
  const [growthLogs, setGrowthLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingAvatar, setEditingAvatar] = useState(false)
  const [stampCount, setStampCount] = useState(0)
  const [stampedByMe, setStampedByMe] = useState(false)
  const [stamping, setStamping] = useState(false)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      supabase.from('profiles').select('*').eq('id', id).single(),
      fetchPostsByAuthor(id),
      fetchMyPlants(id),
      fetchGrowthLogsByAuthor(id),
      fetchStampInfo(id, user?.id),
    ]).then(([profileRes, postsRes, plantsRes, growthRes, stampRes]) => {
      setProfile(profileRes.data)
      setPosts(postsRes.data || [])
      setPlants(plantsRes.data || [])
      setGrowthLogs(growthRes.data || [])
      setStampCount(stampRes.count)
      setStampedByMe(stampRes.stampedByMe)
      setLoading(false)
    })
  }, [id, user?.id])

  const handleStamp = async () => {
    if (!user || stamping) return
    setStamping(true)
    const nowStamped = await toggleStamp(id, user.id, stampedByMe)
    setStampedByMe(nowStamped)
    setStampCount((c) => c + (nowStamped ? 1 : -1))
    setStamping(false)
  }

  // 커뮤니티 성장일지 카드를 눌러 들어온 경우, 해당 기록으로 스크롤 이동
  useEffect(() => {
    if (loading || !location.hash) return
    const el = document.getElementById(location.hash.slice(1))
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [loading, location.hash])

  const isOwner = user && profile && user.id === profile.id

  if (loading) {
    return (
      <div style={{ padding: '0 20px 60px' }}>
        <BackHeader title="프로필" />
        <p className="muted">불러오는 중...</p>
      </div>
    )
  }
  if (!profile) {
    return (
      <div style={{ padding: '0 20px 60px' }}>
        <BackHeader title="프로필" />
        <p className="muted">존재하지 않는 사용자예요.</p>
      </div>
    )
  }

  const grade = getGrade(computeGardenScore(plants))

  return (
    <div style={{ padding: '0 20px 60px' }}>
      <BackHeader title="프로필" />
      <div className="card" style={{ padding: '28px 32px', marginTop: 4, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt=""
                style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : (
              <span className="avatar-circle" style={{ width: 56, height: 56, fontSize: 20 }}>{profile.username?.[0] || '?'}</span>
            )}
            {isOwner && (
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
            )}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <h2 style={{ margin: 0, minWidth: 0, overflowWrap: 'anywhere' }}>{profile.username}</h2>
              <span className="badge grade-badge">{grade.emoji} {grade.name}</span>
              <Link to="/grades" style={{ fontSize: 12 }}>등급 안내 →</Link>
            </div>
            {profile.location && (
              <div className="muted"><MapPin size={13} style={{ verticalAlign: -1 }} /> {profile.location}</div>
            )}
          </div>
        </div>
        {profile.bio && <p style={{ marginTop: 14 }}>{profile.bio}</p>}

        {user && user.id !== profile.id && (
          <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
            <Link to={`/messages?with=${profile.id}`}>
              <button className="secondary">
                <MessageSquare size={14} /> 쪽지 보내기
              </button>
            </Link>
            <button className={stampedByMe ? '' : 'secondary'} onClick={handleStamp} disabled={stamping}>
              <ThumbsUp size={14} fill={stampedByMe ? 'currentColor' : 'none'} /> {stampedByMe ? '응원했어요' : '응원하기'} {stampCount > 0 && `(${stampCount})`}
            </button>
          </div>
        )}
        {(!user || user.id === profile.id) && stampCount > 0 && (
          <p className="muted" style={{ marginTop: 10, marginBottom: 0 }}>
            <ThumbsUp size={13} style={{ verticalAlign: -2 }} /> 이웃들의 초록 엄지 응원 {stampCount}개
          </p>
        )}

        <div className="profile-stat-row">
          <div className="profile-stat">
            <div className="profile-stat-value">{posts.length}</div>
            <div className="muted">게시물</div>
          </div>
          <div className="profile-stat">
            <div className="profile-stat-value">{plants.length}</div>
            <div className="muted">키우는 식물</div>
          </div>
          <div className="profile-stat">
            <div className="profile-stat-value">{grade.score}</div>
            <div className="muted">그린 포인트</div>
          </div>
        </div>

        {grade.next && (
          <p className="muted" style={{ marginTop: 12, marginBottom: 0 }}>
            다음 등급 {grade.next.emoji} {grade.next.name}까지 {grade.next.pointsToNext}점 남았어요
          </p>
        )}
      </div>

      {plants.length > 0 && (
        <>
          <h3><Sprout size={17} style={{ verticalAlign: -3, marginRight: 5 }} />{profile.username}님이 키우는 식물</h3>
          <div className="magazine-feed" style={{ marginBottom: 28 }}>
            {plants.map((plant) => (
              <div key={plant.id} className="magazine-card">
                <div className="magazine-card-media">
                  {plant.photo_url ? <img src={plant.photo_url} alt="" /> : <div className="magazine-card-media-placeholder">🌿</div>}
                </div>
                <div className="magazine-card-body">
                  <div className="magazine-card-title" style={{ marginTop: 0 }}>{plant.name}</div>
                  {plant.species && <div className="muted">{plant.species}</div>}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {growthLogs.length > 0 && (
        <>
          <h3><Sprout size={17} style={{ verticalAlign: -3, marginRight: 5 }} />{profile.username}님의 성장일지</h3>
          <div className="magazine-feed" style={{ marginBottom: 28 }}>
            {growthLogs.map((log) => (
              <div key={log.id} id={`growth-${log.id}`} className="magazine-card" style={{ scrollMarginTop: 20 }}>
                <div className="magazine-card-media">
                  <img src={log.photo_url} alt="" />
                </div>
                <div className="magazine-card-body">
                  {log.plant?.name && <span className="badge">🌿 {log.plant.name}</span>}
                  <div className="magazine-card-title">{log.note || '성장 기록'}</div>
                  <div className="muted">{new Date(log.log_date).toLocaleDateString('ko-KR')}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <h3><Image size={17} style={{ verticalAlign: -3, marginRight: 5 }} />{profile.username}님의 스토리</h3>
      {posts.length === 0 ? (
        <p className="muted">아직 작성한 게시물이 없어요.</p>
      ) : (
        <div className="magazine-feed">
          {posts.map((post) => (
            <Link key={post.id} to={`/posts/${post.id}`} className="magazine-card">
              <div className="magazine-card-media">
                {post.image_url ? <img src={post.image_url} alt="" /> : <div className="magazine-card-media-placeholder">🌿</div>}
              </div>
              <div className="magazine-card-body">
                <span className="badge">{CATEGORY_LABEL[post.category] || post.category}</span>
                <div className="magazine-card-title">{post.title}</div>
                <div className="muted">{new Date(post.created_at).toLocaleDateString('ko-KR')}</div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {editingAvatar && (
        <AvatarEditModal
          userId={user.id}
          currentUrl={profile.avatar_url}
          onClose={() => setEditingAvatar(false)}
          onSaved={(nextUrl) => {
            setProfile((prev) => ({ ...prev, avatar_url: nextUrl }))
            setEditingAvatar(false)
          }}
        />
      )}
    </div>
  )
}
