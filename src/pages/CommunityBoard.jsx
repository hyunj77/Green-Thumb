import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import BackHeader from '../components/BackHeader'
import CommunityFeedList from '../components/CommunityFeedList'
import { fetchPosts, PAGE_SIZE } from '../lib/posts'
import { fetchPublicGrowthFeed } from '../lib/growthLogs'
import { findTab, normalizeGrowthLog, normalizePost } from '../lib/communityTabs'

export default function CommunityBoard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { boardKey } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const page = Number(searchParams.get('page') || '1')
  const tab = findTab(boardKey)

  const [items, setItems] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('list')
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('recent')

  useEffect(() => {
    if (!tab) return
    setLoading(true)
    let cancelled = false

    async function load() {
      if (tab.key === 'growth') {
        const { data } = await fetchPublicGrowthFeed(60)
        const filtered = (data || []).filter((log) => !search || (log.note || '').includes(search) || (log.plant?.name || '').includes(search))
        const normalized = filtered.map(normalizeGrowthLog)
        if (!cancelled) {
          setTotalCount(normalized.length)
          setItems(normalized.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE))
        }
        return
      }

      const { data, count } = await fetchPosts({ categories: tab.categories, search: search || undefined, sort, page })
      if (!cancelled) {
        setItems((data || []).map(normalizePost))
        setTotalCount(count || 0)
      }
    }

    load().finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [tab, search, sort, page])

  if (!tab) {
    return (
      <div className="glass-home">
        <p className="muted" style={{ padding: '40px 0', textAlign: 'center' }}>존재하지 않는 게시판이에요.</p>
      </div>
    )
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))
  const goPage = (p) => setSearchParams({ page: String(p) })
  const handleSearch = (e) => {
    e.preventDefault()
    setSearch(searchInput.trim())
  }

  return (
    <div className="glass-home">
      <BackHeader title={tab.label} onBack={() => navigate('/community')} />

      <div className="gt-section" style={{ marginTop: 4 }}>
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
