import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { LayoutGrid, List, MessageCircle, Plus, Search, Sprout } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { fetchPosts, fetchChallengeStories, CATEGORY_GROUPS, CATEGORY_LABEL, PAGE_SIZE } from '../lib/posts'
import { timeAgo } from '../lib/time'

export default function Community() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const category = searchParams.get('category') || ''
  const page = Number(searchParams.get('page') || '1')

  const [posts, setPosts] = useState([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('list')
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [challengeStories, setChallengeStories] = useState([])

  useEffect(() => {
    setLoading(true)
    fetchPosts({ category: category || undefined, search: search || undefined, page }).then(({ data, count }) => {
      setPosts(data || [])
      setCount(count || 0)
      setLoading(false)
    })
  }, [category, search, page])

  useEffect(() => {
    fetchChallengeStories().then(({ data }) => setChallengeStories(data))
  }, [])

  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE))
  const goCategory = (cat) => setSearchParams(cat ? { category: cat } : {})
  const goPage = (p) => setSearchParams({ ...(category && { category }), page: String(p) })
  const handleSearch = (e) => {
    e.preventDefault()
    setSearch(searchInput.trim())
  }
  const recentWithPhoto = posts.filter((p) => p.image_url).slice(0, 8)

  return (
    <div style={{ padding: '0 20px 60px', position: 'relative' }}>
      <h2 style={{ marginTop: 20 }}>🌿 커뮤니티</h2>

      <form onSubmit={handleSearch} style={{ position: 'relative', maxWidth: 360 }}>
        <Search size={16} style={{ position: 'absolute', left: 14, top: 13, color: 'var(--accent)' }} />
        <input
          type="text"
          placeholder="게시물 제목 검색"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          style={{ paddingLeft: 38 }}
        />
      </form>

      <div className="board-menu">
        <div className="chip-row" style={{ marginTop: 0 }}>
          <button className={`chip ${category === '' ? 'chip-active' : ''}`} onClick={() => goCategory('')}>전체</button>
        </div>

        {CATEGORY_GROUPS.map((group) => (
          <div key={group.title} className="board-group">
            <div className="board-group-title">{group.title}</div>
            <div className="chip-row" style={{ marginTop: 0 }}>
              {group.categories.map((cat) => (
                <button key={cat} className={`chip ${category === cat ? 'chip-active' : ''}`} onClick={() => goCategory(cat)}>
                  {CATEGORY_LABEL[cat]}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {recentWithPhoto.length > 0 && (
        <div style={{ marginTop: 28 }}>
          <h3 style={{ fontSize: 16, marginBottom: 10 }}>새롭게 올라온 스토리 👀</h3>
          <div className="story-scroll">
            {recentWithPhoto.map((post) => (
              <Link key={post.id} to={`/posts/${post.id}`} className="story-thumb">
                <img src={post.image_url} alt="" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {challengeStories.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <h3 style={{ fontSize: 16, marginBottom: 10 }}>🏆 루틴 챌린지 인증 스토리</h3>
          <div className="story-scroll">
            {challengeStories.map((post) => (
              <Link key={post.id} to={`/posts/${post.id}`} className="story-thumb">
                <img src={post.image_url} alt="" />
              </Link>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginTop: 28 }}>
        <div className="view-toggle">
          <button className={viewMode === 'list' ? 'view-toggle-active' : ''} onClick={() => setViewMode('list')}>
            <List size={14} /> 리스트로 보기
          </button>
          <button className={viewMode === 'grid' ? 'view-toggle-active' : ''} onClick={() => setViewMode('grid')}>
            <LayoutGrid size={14} /> 이미지만 보기
          </button>
        </div>

        {loading ? (
          <p className="muted">불러오는 중...</p>
        ) : posts.length === 0 ? (
          <p className="muted">아직 게시물이 없어요. 첫 글을 남겨보세요!</p>
        ) : viewMode === 'list' ? (
          <div className="community-list">
            {posts.map((post) => (
              <div key={post.id} className="community-item" onClick={() => navigate(`/posts/${post.id}`)}>
                <div className="community-item-main">
                  <div className="community-item-head">
                    {post.author?.id ? (
                      <Link
                        to={`/users/${post.author.id}`}
                        onClick={(e) => e.stopPropagation()}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'inherit' }}
                      >
                        <span className="avatar-circle">{(post.author?.username || '?')[0]}</span>
                        <span style={{ fontWeight: 700, color: 'var(--text-h)' }}>{post.author?.username || '알 수 없음'}</span>
                      </Link>
                    ) : (
                      <>
                        <span className="avatar-circle">?</span>
                        <span style={{ fontWeight: 700, color: 'var(--text-h)' }}>알 수 없음</span>
                      </>
                    )}
                    <span className="muted">· {timeAgo(post.created_at)}</span>
                  </div>
                  <div className="community-item-text">
                    {post.title}
                    {post.plant?.name && <span className="muted" style={{ marginLeft: 6, fontWeight: 400 }}>🌿 {post.plant.name}</span>}
                  </div>
                  <div className="community-item-foot">
                    <span className="badge">{CATEGORY_LABEL[post.category] || post.category}</span>
                    <span className="muted community-stat"><Sprout size={13} /> {post.reaction_count}</span>
                    <span className="muted community-stat"><MessageCircle size={13} /> {post.comment_count}</span>
                  </div>
                </div>
                {post.image_url && (
                  <div className="community-item-thumb">
                    <img src={post.image_url} alt="" />
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="magazine-feed">
            {posts.map((post) => (
              <Link key={post.id} to={`/posts/${post.id}`} className="magazine-card">
                <div className="magazine-card-media">
                  {post.image_url ? (
                    <img src={post.image_url} alt="" />
                  ) : (
                    <div className="magazine-card-media-placeholder">🌿</div>
                  )}
                </div>
                <div className="magazine-card-body">
                  <span className="badge">{CATEGORY_LABEL[post.category] || post.category}</span>
                  <div className="magazine-card-title">
                    {post.title}
                    {post.plant?.name && <span className="muted" style={{ marginLeft: 8, fontWeight: 400 }}>🌿 {post.plant.name}</span>}
                  </div>
                  <div className="muted">{post.author?.username || '알 수 없음'}</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 24 }}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button key={p} className={p === page ? '' : 'secondary'} onClick={() => goPage(p)} style={{ padding: '8px 14px' }}>
              {p}
            </button>
          ))}
        </div>
      )}

      {user && (
        <Link to="/write" className="fab-write">
          <Plus size={18} /> 글쓰기
        </Link>
      )}
    </div>
  )
}
