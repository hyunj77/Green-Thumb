import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Plus, Sprout } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import HeroBanner from '../components/HeroBanner'
import CommunityFeedList from '../components/CommunityFeedList'
import { supabase } from '../lib/supabase'
import { fetchPublicGrowthFeed } from '../lib/growthLogs'
import { PAGE_SIZE } from '../lib/posts'
import { TOP_TABS, normalizeGrowthLog, normalizePost } from '../lib/communityTabs'

// '전체' 피드 병합용: 페이지네이션 없이 최근 게시물을 넉넉히 가져온다
async function fetchRecentPostsPool(search, limit = 60) {
  let query = supabase
    .from('posts')
    .select('id, title, content, image_url, category, created_at, author:profiles(id, username), plant:plants(name), comments(count), post_reactions(count)')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (search) query = query.ilike('title', `%${search}%`)
  const { data } = await query
  return (data || []).map((post) => ({
    ...post,
    comment_count: post.comments?.[0]?.count ?? 0,
    reaction_count: post.post_reactions?.[0]?.count ?? 0,
  }))
}

export default function Community() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const page = Number(searchParams.get('page') || '1')

  const [items, setItems] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('list')
  const [searchInput, setSearchInput] = useState(() => searchParams.get('q') || '')
  const [search, setSearch] = useState(() => searchParams.get('q') || '')
  const [sort, setSort] = useState('recent')
  const [growthSpotlight, setGrowthSpotlight] = useState([])

  useEffect(() => {
    fetchPublicGrowthFeed(10).then(({ data }) => setGrowthSpotlight(data || []))
  }, [])

  useEffect(() => {
    setLoading(true)
    let cancelled = false

    async function load() {
      const [postData, growthResult] = await Promise.all([
        fetchRecentPostsPool(search, 60),
        fetchPublicGrowthFeed(30),
      ])
      const merged = [
        ...postData.map(normalizePost),
        ...(growthResult.data || [])
          .filter((log) => !search || (log.note || '').includes(search) || (log.plant?.name || '').includes(search))
          .map(normalizeGrowthLog),
      ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

      let ranked = merged
      if (sort === 'popular') {
        ranked = [...merged].sort((a, b) => {
          const scoreA = a.kind === 'post' ? (a.reaction_count || 0) + (a.comment_count || 0) : 0
          const scoreB = b.kind === 'post' ? (b.reaction_count || 0) + (b.comment_count || 0) : 0
          return scoreB - scoreA
        })
      }
      if (!cancelled) {
        setTotalCount(ranked.length)
        setItems(ranked.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE))
      }
    }

    load().finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [search, sort, page])

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))
  const goPage = (p) => setSearchParams({ page: String(p) })
  const handleSearch = (e) => {
    e.preventDefault()
    setSearch(searchInput.trim())
  }

  return (
    <div className="glass-home">
      <div className="gt-topbar" style={{ paddingTop: 18 }}>
        <h2 className="gt-page-title">커뮤니티</h2>
      </div>

      <div className="gt-chip-row" style={{ marginBottom: 4 }}>
        <button
          className="gt-chip"
          style={{ background: 'linear-gradient(135deg, var(--gt-sage), var(--gt-sage-deep))', color: '#fff', border: 'none' }}
        >
          전체
        </button>
        {TOP_TABS.filter((t) => t.key !== 'all').map((tab) => (
          <Link key={tab.key} to={`/community/board/${tab.key}`} className="gt-chip">
            {tab.label}
          </Link>
        ))}
      </div>

      <div className="gt-section">
        <HeroBanner />
      </div>

      {growthSpotlight.length > 0 && (
        <div className="gt-section">
          <div className="gt-section-head">
            <span className="gt-section-title">초록빛 일상을 가꾸는 이웃들의 식물 이야기</span>
            <Link to="/community/board/growth" className="gt-section-link">더보기</Link>
          </div>
          <div className="gt-post-scroll">
            {growthSpotlight.map((log) => (
              <Link key={log.id} to={`/users/${log.plant?.owner?.id}`} className="gt-post-card" style={{ width: 168 }}>
                {log.photo_url ? (
                  <img className="gt-post-photo" style={{ height: 150 }} src={log.photo_url} alt="" />
                ) : (
                  <div className="gt-post-photo" style={{ height: 150, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>🌱</div>
                )}
                <div className="gt-post-body" style={{ padding: '10px 12px 12px' }}>
                  <div className="gt-post-title" style={{ fontSize: 12.5 }}><Sprout size={12} style={{ marginRight: 4, verticalAlign: -2 }} />{log.plant?.name || '식물'}</div>
                  <div className="gt-post-meta" style={{ marginTop: 4 }}>
                    <span>{log.plant?.owner?.username || '익명'}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="gt-section">
        <div className="gt-section-head">
          <span className="gt-section-title">게시글 (전체)</span>
        </div>

        <CommunityFeedList
          items={items}
          loading={loading}
          viewMode={viewMode}
          setViewMode={setViewMode}
          sort={sort}
          setSort={setSort}
          searchInput={searchInput}
          setSearchInput={setSearchInput}
          onSearch={handleSearch}
          page={page}
          totalPages={totalPages}
          goPage={goPage}
          onCardClick={navigate}
        />
      </div>

      {user && (
        <Link to="/write" className="fab-write">
          <Plus size={18} /> 글쓰기
        </Link>
      )}
    </div>
  )
}
