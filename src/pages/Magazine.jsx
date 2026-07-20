import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { MessageCircle, Sprout } from 'lucide-react'
import { fetchFeaturedPosts, CATEGORY_LABEL } from '../lib/posts'

export default function Magazine() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFeaturedPosts().then(({ data }) => {
      setPosts(data || [])
      setLoading(false)
    })
  }, [])

  return (
    <div style={{ padding: '0 20px 60px' }}>
      <h2 style={{ marginTop: 20 }}>📰 매거진</h2>
      <p className="muted" style={{ marginBottom: 20 }}>사진과 함께 반응이 많았던 이웃 집사들의 이야기를 모았어요</p>

      {loading ? (
        <p className="muted">불러오는 중...</p>
      ) : posts.length === 0 ? (
        <p className="muted">사진이 있는 게시물이 아직 없어요. 사진과 함께 글을 남겨보세요!</p>
      ) : (
        <div className="magazine-overlay-feed">
          {posts.map((post) => (
            <Link key={post.id} to={`/posts/${post.id}`} className="magazine-overlay-card">
              <img src={post.image_url} alt="" />
              <div className="magazine-overlay-scrim" />
              <div className="magazine-overlay-content">
                <span className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}>
                  {CATEGORY_LABEL[post.category] || post.category}
                </span>
                <div className="magazine-overlay-title">{post.title}</div>
                <div className="magazine-overlay-meta">
                  <span>{post.author?.username || '알 수 없음'}</span>
                  <span className="community-stat"><Sprout size={13} /> {post.reaction_count}</span>
                  <span className="community-stat"><MessageCircle size={13} /> {post.comment_count}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
