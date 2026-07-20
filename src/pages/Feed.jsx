import { Link, useSearchParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { fetchPosts, CATEGORIES, CATEGORY_LABEL, PAGE_SIZE } from '../lib/posts'
import ContactCard from '../components/ContactCard'
import GuestbookSection from '../components/GuestbookSection'

export default function Feed() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const category = searchParams.get('category') || ''
  const page = Number(searchParams.get('page') || '1')

  const [posts, setPosts] = useState([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetchPosts({ category: category || undefined, page }).then(({ data, count }) => {
      setPosts(data || [])
      setCount(count || 0)
      setLoading(false)
    })
  }, [category, page])

  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE))
  const goCategory = (cat) => setSearchParams(cat ? { category: cat } : {})
  const goPage = (p) => setSearchParams({ ...(category && { category }), page: String(p) })

  return (
    <div style={{ padding: '0 20px 40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className={category === '' ? '' : 'secondary'} onClick={() => goCategory('')}>전체</button>
          {CATEGORIES.map((cat) => (
            <button key={cat} className={category === cat ? '' : 'secondary'} onClick={() => goCategory(cat)}>
              {CATEGORY_LABEL[cat]}
            </button>
          ))}
        </div>
        {user && <Link to="/write"><button>글쓰기</button></Link>}
      </div>

      {loading ? (
        <p className="muted">불러오는 중...</p>
      ) : posts.length === 0 ? (
        <p className="muted">아직 게시물이 없어요. 첫 글을 남겨보세요!</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {posts.map((post) => (
            <Link key={post.id} to={`/posts/${post.id}`} className="card" style={{ display: 'flex', gap: 16, color: 'inherit' }}>
              {post.image_url && (
                <img src={post.image_url} alt="" style={{ width: 72, height: 72, borderRadius: 14, objectFit: 'cover', flexShrink: 0 }} />
              )}
              <div style={{ minWidth: 0 }}>
                <span className="badge">{CATEGORY_LABEL[post.category] || post.category}</span>
                <div style={{ fontWeight: 700, color: 'var(--text-h)', marginTop: 6 }}>
                  {post.title}
                  {post.plant?.name && <span className="muted" style={{ marginLeft: 8, fontWeight: 400 }}>🌿 {post.plant.name}</span>}
                </div>
                <div className="muted">
                  {post.author?.username || '알 수 없음'} · {new Date(post.created_at).toLocaleDateString('ko-KR')}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 24 }}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button key={p} className={p === page ? '' : 'secondary'} onClick={() => goPage(p)} style={{ padding: '8px 14px' }}>
              {p}
            </button>
          ))}
        </div>
      )}

      <div className="home-lower">
        <ContactCard />
        <GuestbookSection />
      </div>
    </div>
  )
}
