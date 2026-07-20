import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { MapPin } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { fetchPostsByAuthor, CATEGORY_LABEL } from '../lib/posts'

export default function UserProfile() {
  const { id } = useParams()
  const [profile, setProfile] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      supabase.from('profiles').select('*').eq('id', id).single(),
      fetchPostsByAuthor(id),
    ]).then(([profileRes, postsRes]) => {
      setProfile(profileRes.data)
      setPosts(postsRes.data || [])
      setLoading(false)
    })
  }, [id])

  if (loading) return <p className="muted" style={{ padding: 20 }}>불러오는 중...</p>
  if (!profile) return <p className="muted" style={{ padding: 20 }}>존재하지 않는 사용자예요.</p>

  return (
    <div style={{ padding: '0 20px 60px' }}>
      <div className="card" style={{ padding: '28px 32px', marginTop: 20, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span className="avatar-circle" style={{ width: 48, height: 48, fontSize: 18 }}>{profile.username?.[0] || '?'}</span>
          <div>
            <h2 style={{ margin: 0 }}>{profile.username}</h2>
            {profile.location && (
              <div className="muted"><MapPin size={13} style={{ verticalAlign: -1 }} /> {profile.location}</div>
            )}
          </div>
        </div>
        {profile.bio && <p style={{ marginTop: 14 }}>{profile.bio}</p>}
      </div>

      <h3>🌿 {profile.username}님의 스토리</h3>
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
