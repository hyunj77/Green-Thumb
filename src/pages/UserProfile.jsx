import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { MapPin } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { fetchPostsByAuthor, CATEGORY_LABEL } from '../lib/posts'
import { fetchMyPlants } from '../lib/plants'
import { computeGardenScore, getGrade } from '../lib/grade'

export default function UserProfile() {
  const { id } = useParams()
  const [profile, setProfile] = useState(null)
  const [posts, setPosts] = useState([])
  const [plants, setPlants] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      supabase.from('profiles').select('*').eq('id', id).single(),
      fetchPostsByAuthor(id),
      fetchMyPlants(id),
    ]).then(([profileRes, postsRes, plantsRes]) => {
      setProfile(profileRes.data)
      setPosts(postsRes.data || [])
      setPlants(plantsRes.data || [])
      setLoading(false)
    })
  }, [id])

  if (loading) return <p className="muted" style={{ padding: 20 }}>불러오는 중...</p>
  if (!profile) return <p className="muted" style={{ padding: 20 }}>존재하지 않는 사용자예요.</p>

  const grade = getGrade(computeGardenScore(plants))

  return (
    <div style={{ padding: '0 20px 60px' }}>
      <div className="card" style={{ padding: '28px 32px', marginTop: 20, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span className="avatar-circle" style={{ width: 56, height: 56, fontSize: 20 }}>{profile.username?.[0] || '?'}</span>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h2 style={{ margin: 0 }}>{profile.username}</h2>
              <span className="badge grade-badge">{grade.emoji} {grade.name}</span>
              <Link to="/grades" style={{ fontSize: 12 }}>등급 안내 →</Link>
            </div>
            {profile.location && (
              <div className="muted"><MapPin size={13} style={{ verticalAlign: -1 }} /> {profile.location}</div>
            )}
          </div>
        </div>
        {profile.bio && <p style={{ marginTop: 14 }}>{profile.bio}</p>}

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
          <h3>🌿 {profile.username}님이 키우는 식물</h3>
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

      <h3>📷 {profile.username}님의 스토리</h3>
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
    </div>
  )
}
