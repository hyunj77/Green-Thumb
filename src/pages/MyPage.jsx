import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { fetchMyPosts } from '../lib/posts'
import { supabase } from '../lib/supabase'

export default function MyPage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [posts, setPosts] = useState([])

  useEffect(() => {
    if (!user) return
    supabase.from('profiles').select('*').eq('id', user.id).single().then(({ data }) => setProfile(data))
    fetchMyPosts(user.id).then(({ data }) => setPosts(data || []))
  }, [user])

  if (!user) return null

  return (
    <div style={{ padding: '0 20px 40px', maxWidth: 640, margin: '0 auto' }}>
      <div className="card" style={{ padding: '28px 32px', marginBottom: 20 }}>
        <h2>{profile?.username || '...'}</h2>
        <p className="muted">{user.email}</p>
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
