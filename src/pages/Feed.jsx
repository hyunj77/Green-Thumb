import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, Droplet, Camera, NotebookPen, Heart, Sprout, MessageCircle, Check } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import GreenieGame from '../components/GreenieGame'
import { fetchFeaturedPosts } from '../lib/posts'
import { fetchMyPlants, waterPlant, nextWateringDate } from '../lib/plants'
import { PLANT_SPECIES, PLANT_TYPES } from '../lib/encyclopedia'
import { fetchSuggestedGardeners, fetchFollowingIds, toggleFollow } from '../lib/follows'
import { timeAgo } from '../lib/time'

const TYPE_EMOJI = { 관엽식물: '🌿', '다육·선인장': '🌵', '꽃·개화식물': '🌸', '허브·식용': '🌱', 행잉식물: '🪴', 공기정화: '🍃', 수경재배: '💧', 초보자용: '🔰' }
const HOME_CATEGORY_PREVIEW = PLANT_TYPES.slice(0, 5)

function todaySpecies() {
  const key = new Date().toISOString().slice(0, 10)
  let hash = 0
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0
  return PLANT_SPECIES[hash % PLANT_SPECIES.length]
}

export default function Feed() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [profile, setProfile] = useState(null)
  const [searchInput, setSearchInput] = useState('')

  const [myPlants, setMyPlants] = useState([])
  const [wateringAll, setWateringAll] = useState(false)
  const [localMissions, setLocalMissions] = useState({ photo: false, growthLog: false, like: false, visitGreenie: false })

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
      setProfile(null)
      setMyPlants([])
      setFollowingIds([])
      return
    }
    supabase.from('profiles').select('*').eq('id', user.id).single().then(({ data }) => setProfile(data))
    fetchMyPlants(user.id).then(({ data }) => setMyPlants(data || []))
    fetchFollowingIds(user.id).then(({ data }) => setFollowingIds(data || []))
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

  return (
    <div className="glass-home">
      <div className="gt-topbar">
        <Link to={user ? '/mypage' : '/login'} className="gt-avatar">
          {profile?.avatar_url ? <img src={profile.avatar_url} alt="" /> : (profile?.username?.[0] || user?.email?.[0] || '🌱').toUpperCase()}
        </Link>
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
          <button className="gt-mission-item" data-done={localMissions.photo} onClick={() => handleMissionGo('photo', '/garden')}>
            <span className="gt-mission-check">{localMissions.photo ? <Check size={16} /> : <Camera size={16} />}</span>
            <span className="gt-mission-label">사진</span>
          </button>
          <button className="gt-mission-item" data-done={localMissions.growthLog} onClick={() => handleMissionGo('growthLog', '/garden')}>
            <span className="gt-mission-check">{localMissions.growthLog ? <Check size={16} /> : <NotebookPen size={16} />}</span>
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

      <div className="gt-section">
        <div className="gt-section-head">
          <span className="gt-section-title">식물 카테고리</span>
        </div>
        <div className="gt-chip-row gt-category-row">
          {HOME_CATEGORY_PREVIEW.map((type) => (
            <Link key={type} to={`/encyclopedia?type=${encodeURIComponent(type)}`} className="gt-chip">
              <span className="gt-chip-emoji">{TYPE_EMOJI[type]}</span>
              {type}
            </Link>
          ))}
          <Link to="/encyclopedia" className="gt-chip gt-chip-more">
            <span className="gt-chip-emoji">＋</span>
            더보기
          </Link>
        </div>
      </div>

      <div className="gt-section">
        <button
          className="gt-ai-card"
          style={{ width: '100%', textAlign: 'left' }}
          onClick={() => navigate('/garden')}
        >
          <div className="gt-ai-eyebrow">AI 식물 진단</div>
          <div className="gt-ai-title">사진 한 장으로 병충해·건강 상태 확인</div>
          <p className="gt-ai-desc">마이 그린 도감에서 준비 중이에요. 조금만 기다려주세요.</p>
          <span className="gt-pill-btn gt-ai-btn"><Camera size={14} /> 사진 촬영하고 진단받기</span>
        </button>
      </div>

      <div className="gt-section">
        <div className="gt-section-head">
          <span className="gt-section-title">오늘의 식물</span>
          <Link to="/encyclopedia" className="gt-section-link">도감 보기</Link>
        </div>
        <Link to={`/encyclopedia?type=${encodeURIComponent(todayPlant.type)}`} className="gt-card gt-today-plant">
          <div className="gt-today-plant-emoji">{todayPlant.emoji}</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 15 }}>{todayPlant.name}</div>
            <div className="gt-greenie-sub" style={{ marginTop: 2 }}>{todayPlant.watering} · {todayPlant.light}</div>
            <div className="gt-today-plant-tags">
              <span>난이도 {todayPlant.difficulty}</span>
              <span>{todayPlant.petSafe ? '반려동물 안전' : '반려동물 주의'}</span>
            </div>
          </div>
        </Link>
      </div>

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
    </div>
  )
}
