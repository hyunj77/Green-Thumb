import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, Droplet, Camera, NotebookPen, Heart, Sprout, MessageCircle, Check, ArrowRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import GreenieGame from '../components/GreenieGame'
import { fetchFeaturedPosts } from '../lib/posts'
import { fetchMyPlants, waterPlant, nextWateringDate } from '../lib/plants'
import { fetchTodayGrowthLogsByAuthor } from '../lib/growthLogs'
import { PLANT_SPECIES, PLANT_TYPES } from '../lib/encyclopedia'
import { PLANT_DIRECTORY } from '../lib/plantDirectory'
import { fetchSuggestedGardeners, fetchFollowingIds, toggleFollow } from '../lib/follows'
import { timeAgo } from '../lib/time'

const TYPE_EMOJI = { 관엽식물: '🌿', '다육·선인장': '🌵', '꽃·개화식물': '🌸', '허브·식용': '🌱', 행잉식물: '🪴', 공기정화: '🍃', 수경재배: '💧', 초보자용: '🔰' }
const HOME_CATEGORY_PREVIEW = PLANT_TYPES.slice(0, 4)
const ALL_DIRECTORY_PLANTS = [...PLANT_SPECIES, ...PLANT_DIRECTORY]

function todaySpecies() {
  const key = new Date().toISOString().slice(0, 10)
  let hash = 0
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0
  return PLANT_SPECIES[hash % PLANT_SPECIES.length]
}

// 오늘 날짜로 고정된 시드로 도감 미리보기 10종을 뽑는다 (새로고침해도 하루 동안은 동일)
function todayDirectoryPreview(count = 10) {
  const key = new Date().toISOString().slice(0, 10)
  let seed = 0
  for (let i = 0; i < key.length; i++) seed = (seed * 31 + key.charCodeAt(i)) >>> 0
  const pool = [...ALL_DIRECTORY_PLANTS]
  const picked = []
  for (let i = 0; i < count && pool.length > 0; i++) {
    seed = (seed * 1103515245 + 12345) >>> 0
    const idx = seed % pool.length
    picked.push(pool[idx])
    pool.splice(idx, 1)
  }
  return picked
}

export default function Feed() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [searchInput, setSearchInput] = useState('')

  const [myPlants, setMyPlants] = useState([])
  const [plantsLoaded, setPlantsLoaded] = useState(false)
  const [wateringAll, setWateringAll] = useState(false)
  const [todayGrowthLogs, setTodayGrowthLogs] = useState([])
  const [localMissions, setLocalMissions] = useState({ like: false, visitGreenie: false })

  const [featuredPosts, setFeaturedPosts] = useState([])
  const [gardeners, setGardeners] = useState([])
  const [followingIds, setFollowingIds] = useState([])

  useEffect(() => {
    fetchFeaturedPosts(8).then(({ data }) => setFeaturedPosts(data || []))
  }, [])

  useEffect(() => {
    fetchSuggestedGardeners(user?.id).then(({ data }) => setGardeners(data || []))
  }, [user])

  useEffect(() => {
    if (!user) {
      setMyPlants([])
      setFollowingIds([])
      setTodayGrowthLogs([])
      setPlantsLoaded(false)
      return
    }
    fetchMyPlants(user.id).then(({ data }) => { setMyPlants(data || []); setPlantsLoaded(true) })
    fetchFollowingIds(user.id).then(({ data }) => setFollowingIds(data || []))
    fetchTodayGrowthLogsByAuthor(user.id).then(({ data }) => setTodayGrowthLogs(data))
  }, [user])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchInput.trim()) navigate(`/community?q=${encodeURIComponent(searchInput.trim())}`)
  }

  const plantsDueToday = myPlants.filter((p) => {
    const next = nextWateringDate(p)
    return next && next <= new Date()
  })
  const waterMissionDone = myPlants.length > 0 && plantsDueToday.length === 0
  const growthLogMissionDone = todayGrowthLogs.length > 0
  const photoMissionDone = todayGrowthLogs.some((log) => log.photo_url)

  const handleWaterMission = async () => {
    if (!user) return navigate('/login')
    if (plantsDueToday.length === 0 || wateringAll) return
    setWateringAll(true)
    await Promise.all(plantsDueToday.map((p) => waterPlant(p.id)))
    const { data } = await fetchMyPlants(user.id)
    setMyPlants(data || [])
    setWateringAll(false)
  }

  const handleMissionGo = (key, to) => {
    if (!user) return navigate('/login')
    setLocalMissions((m) => ({ ...m, [key]: true }))
    navigate(to)
  }

  const handleFollow = async (gardenerId, isFollowing) => {
    if (!user) return navigate('/login')
    await toggleFollow(user.id, gardenerId, isFollowing)
    setFollowingIds((ids) => (isFollowing ? ids.filter((id) => id !== gardenerId) : [...ids, gardenerId]))
  }

  const todayPlant = todaySpecies()
  const directoryPreview = todayDirectoryPreview()

  return (
    <div className="glass-home">
      <div className="gt-topbar">
        <form className="gt-search" onSubmit={handleSearch}>
          <Search size={16} />
          <input
            type="text"
            placeholder="식물, 게시물 검색"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </form>
      </div>

      {user && plantsLoaded && myPlants.length === 0 && (
        <Link to="/garden#new-plant" className="gt-onboarding-banner">
          <div>
            <div className="gt-onboarding-title">🌱 첫 반려식물을 등록해보세요</div>
            <div className="gt-onboarding-desc">식물을 등록하면 물주기 알림, 성장일기, 그린 등급까지 시작돼요</div>
          </div>
          <ArrowRight size={18} />
        </Link>
      )}

      <GreenieGame />

      <div className="gt-section">
        <div className="gt-section-head">
          <span className="gt-section-title">오늘의 미션</span>
        </div>
        <div className="gt-mission-row">
          <button className="gt-mission-item" data-done={waterMissionDone} onClick={handleWaterMission} disabled={wateringAll}>
            <span className="gt-mission-check">{waterMissionDone ? <Check size={16} /> : <Droplet size={16} />}</span>
            <span className="gt-mission-label">물주기</span>
          </button>
          <button className="gt-mission-item" data-done={photoMissionDone} onClick={() => (user ? navigate('/garden') : navigate('/login'))}>
            <span className="gt-mission-check">{photoMissionDone ? <Check size={16} /> : <Camera size={16} />}</span>
            <span className="gt-mission-label">사진</span>
          </button>
          <button className="gt-mission-item" data-done={growthLogMissionDone} onClick={() => (user ? navigate('/garden') : navigate('/login'))}>
            <span className="gt-mission-check">{growthLogMissionDone ? <Check size={16} /> : <NotebookPen size={16} />}</span>
            <span className="gt-mission-label">기록</span>
          </button>
          <button className="gt-mission-item" data-done={localMissions.like} onClick={() => handleMissionGo('like', '/community')}>
            <span className="gt-mission-check">{localMissions.like ? <Check size={16} /> : <Heart size={16} />}</span>
            <span className="gt-mission-label">좋아요</span>
          </button>
          <button className="gt-mission-item" data-done={localMissions.visitGreenie} onClick={() => handleMissionGo('visitGreenie', '/greenie#visit')}>
            <span className="gt-mission-check">{localMissions.visitGreenie ? <Check size={16} /> : <Sprout size={16} />}</span>
            <span className="gt-mission-label">방문</span>
          </button>
        </div>
      </div>

      {/* 도감 둘러보기 — 카테고리·품종 미리보기·오늘의 식물을 하나의 흐름으로 묶어서
          예전처럼 "카테고리 → 도감 미리보기 → 오늘의 식물"이 따로따로 반복되지 않게 함 */}
      <div className="gt-section">
        <div className="gt-section-head">
          <span className="gt-section-title">식물 도감 둘러보기</span>
          <Link to="/encyclopedia" className="gt-section-link">전체 {ALL_DIRECTORY_PLANTS.length}종</Link>
        </div>
        <div className="gt-chip-row gt-category-row">
          {HOME_CATEGORY_PREVIEW.map((type) => (
            <Link key={type} to={`/encyclopedia?type=${encodeURIComponent(type)}`} className="gt-chip">
              <span className="gt-chip-emoji">{TYPE_EMOJI[type]}</span>
              {type.includes('·') ? (
                <span>{type.split('·')[0]}·<br />{type.split('·')[1]}</span>
              ) : type}
            </Link>
          ))}
          <Link to="/encyclopedia" className="gt-chip gt-chip-more">
            <span className="gt-chip-emoji">＋</span>
            더보기
          </Link>
        </div>
        <div className="gt-directory-scroll" style={{ marginTop: 10 }}>
          {directoryPreview.map((p) => (
            <Link key={p.name} to={`/encyclopedia?type=${encodeURIComponent(p.type)}`} className="gt-directory-card">
              <span className="gt-directory-emoji">{p.emoji}</span>
              <span className="gt-directory-name">{p.name}</span>
            </Link>
          ))}
        </div>
        <Link to={`/encyclopedia?type=${encodeURIComponent(todayPlant.type)}`} className="gt-card gt-today-plant" style={{ marginTop: 12 }}>
          <div className="gt-today-plant-emoji">{todayPlant.emoji}</div>
          <div>
            <div className="muted" style={{ fontSize: 11, fontWeight: 700, marginBottom: 2 }}>오늘의 식물</div>
            <div style={{ fontWeight: 800, fontSize: 15 }}>{todayPlant.name}</div>
            <div className="gt-greenie-sub" style={{ marginTop: 2 }}>{todayPlant.watering} · {todayPlant.light}</div>
            <div className="gt-today-plant-tags">
              <span>난이도 {todayPlant.difficulty}</span>
              <span>{todayPlant.petSafe ? '반려동물 안전' : '반려동물 주의'}</span>
            </div>
          </div>
        </Link>
      </div>

      {/* 커뮤니티 — 인기 게시글과 추천 식집사를 한 흐름으로 */}
      {featuredPosts.length > 0 && (
        <div className="gt-section">
          <div className="gt-section-head">
            <span className="gt-section-title">인기 게시글</span>
            <Link to="/community" className="gt-section-link">더보기</Link>
          </div>
          <div className="gt-post-scroll">
            {featuredPosts.map((post) => (
              <Link key={post.id} to={`/posts/${post.id}`} className="gt-post-card">
                {post.image_url ? (
                  <img className="gt-post-photo" src={post.image_url} alt="" />
                ) : (
                  <div className="gt-post-photo" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>🌿</div>
                )}
                <div className="gt-post-body">
                  <div className="gt-post-title">{post.title}</div>
                  <div className="gt-post-meta">
                    <span>{post.author?.username || '익명'}</span>
                    <span>{timeAgo(post.created_at)}</span>
                  </div>
                  <div className="gt-post-meta">
                    <span><Heart size={12} /> {post.reaction_count}</span>
                    <span><MessageCircle size={12} /> {post.comment_count}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {gardeners.length > 0 && (
        <div className="gt-section">
          <div className="gt-section-head">
            <span className="gt-section-title">추천 식집사</span>
          </div>
          <div className="gt-gardener-row">
            {gardeners.map((g) => {
              const isFollowing = followingIds.includes(g.id)
              return (
                <div key={g.id} className="gt-gardener-card">
                  <Link to={`/users/${g.id}`} className="gt-gardener-avatar">
                    {g.avatar_url ? <img src={g.avatar_url} alt="" /> : (g.username?.[0] || '🌱').toUpperCase()}
                  </Link>
                  <Link to={`/users/${g.id}`} className="gt-gardener-name">{g.username}</Link>
                  <div className="gt-gardener-count">식물 {g.plant_count}개</div>
                  <button className="gt-follow-btn" data-following={isFollowing} onClick={() => handleFollow(g.id, isFollowing)}>
                    {isFollowing ? '팔로잉' : '팔로우'}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 준비중인 기능은 맨 아래, 눈에 덜 띄게 — 실제로 동작하는 기능들과 헷갈리지 않도록 */}
      <div className="gt-section">
        <button
          className="gt-ai-card"
          style={{ width: '100%', textAlign: 'left' }}
          onClick={() => navigate('/garden')}
        >
          <div className="gt-ai-eyebrow">AI 식물 진단 · 준비중</div>
          <div className="gt-ai-title">사진 한 장으로 병충해·건강 상태 확인</div>
          <p className="gt-ai-desc">마이 그린 도감에서 준비 중이에요.<br />조금만 기다려주세요.</p>
          <span className="gt-pill-btn gt-ai-btn" style={{ alignSelf: 'center' }}><Camera size={14} /> 미리보기</span>
        </button>
      </div>
    </div>
  )
}
