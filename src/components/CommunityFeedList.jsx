import { Link } from 'react-router-dom'
import { Heart, LayoutGrid, List, MessageCircle, Search } from 'lucide-react'
import { CATEGORY_LABEL, DEAL_STATUS_LABEL, formatDealPrice, isMarketCategory } from '../lib/posts'
import { timeAgo } from '../lib/time'
import GradeBadge from './GradeBadge'

const HOT_THRESHOLD = 3
const isHot = (item) => (item.reaction_count || 0) + (item.comment_count || 0) >= HOT_THRESHOLD

function cardHref(item) {
  return item.kind === 'growth' ? `/users/${item.author?.id}#${item.id}` : `/posts/${item.id}`
}

export default function CommunityFeedList({
  items,
  loading,
  viewMode,
  setViewMode,
  sort,
  setSort,
  searchInput,
  setSearchInput,
  onSearch,
  page,
  totalPages,
  goPage,
  onCardClick,
}) {
  return (
    <div>
      <form onSubmit={onSearch} className="gt-search" style={{ marginBottom: 14 }}>
        <Search size={16} />
        <input type="text" placeholder="게시물 · 성장일지 검색" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
      </form>

      <div className="view-toggle-row">
        <div className="view-toggle" style={{ marginBottom: 0, flexShrink: 0 }}>
          <button className={sort === 'recent' ? 'view-toggle-active' : ''} onClick={() => setSort('recent')}>최신순</button>
          <button className={sort === 'popular' ? 'view-toggle-active' : ''} onClick={() => setSort('popular')}>🔥 인기순</button>
        </div>
        <div className="view-toggle" style={{ marginBottom: 0, flexShrink: 0 }}>
          <button className={viewMode === 'list' ? 'view-toggle-active' : ''} onClick={() => setViewMode('list')}>
            <List size={14} /> 리스트
          </button>
          <button className={viewMode === 'grid' ? 'view-toggle-active' : ''} onClick={() => setViewMode('grid')}>
            <LayoutGrid size={14} /> 이미지
          </button>
        </div>
      </div>

      {loading ? (
        <p className="muted">불러오는 중...</p>
      ) : items.length === 0 ? (
        <p className="muted">아직 콘텐츠가 없어요.</p>
      ) : viewMode === 'list' ? (
        <div className="community-list">
          {items.map((item) => (
            <div key={item.id} className="community-item" onClick={() => onCardClick(cardHref(item))}>
              <div className="community-item-main">
                <div className="community-item-head">
                  <span className="avatar-circle">{(item.author?.username || '?')[0]}</span>
                  <span style={{ fontWeight: 700, color: 'var(--gt-text)' }}>{item.author?.username || '알 수 없음'}</span>
                  <GradeBadge score={item.author?.garden_score} compact />
                  <span className="muted">· {timeAgo(item.created_at)}</span>
                </div>
                <div className="community-item-text">
                  {item.title}
                  {item.plant?.name && item.kind === 'post' && <span className="muted" style={{ marginLeft: 6, fontWeight: 400 }}>🌿 {item.plant.name}</span>}
                </div>
                <div className="community-item-foot">
                  {item.kind === 'growth' ? (
                    <span className="badge">🌱 성장일지</span>
                  ) : (
                    <>
                      {isMarketCategory(item.category) && (
                        <>
                          <span className="badge" style={{ background: 'var(--accent)', color: '#fff' }}>
                            {formatDealPrice(item.category, item.price)}
                          </span>
                          {item.deal_status && item.deal_status !== 'available' && (
                            <span className="badge">{DEAL_STATUS_LABEL[item.deal_status]}</span>
                          )}
                        </>
                      )}
                      {isHot(item) && <span className="badge badge-hot">🔥 인기</span>}
                      <span className="badge">{CATEGORY_LABEL[item.category] || item.category}</span>
                      <span className="muted community-stat"><Heart size={13} /> {item.reaction_count}</span>
                      <span className="muted community-stat"><MessageCircle size={13} /> {item.comment_count}</span>
                    </>
                  )}
                </div>
              </div>
              {item.image_url && (
                <div className="community-item-thumb">
                  <img src={item.image_url} alt="" />
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="magazine-feed">
          {items.map((item) => (
            <Link key={item.id} to={cardHref(item)} className="magazine-card gt-card">
              <div className="magazine-card-media">
                {item.image_url ? <img src={item.image_url} alt="" /> : <div className="magazine-card-media-placeholder">🌿</div>}
              </div>
              <div className="magazine-card-body">
                {item.kind === 'growth' ? (
                  <span className="badge">🌱 성장일지</span>
                ) : (
                  <>
                    {isMarketCategory(item.category) && (
                      <span className="badge" style={{ background: 'var(--accent)', color: '#fff', marginRight: 6 }}>
                        {formatDealPrice(item.category, item.price)}
                      </span>
                    )}
                    {isHot(item) && <span className="badge badge-hot" style={{ marginRight: 6 }}>🔥 인기</span>}
                    <span className="badge">{CATEGORY_LABEL[item.category] || item.category}</span>
                  </>
                )}
                <div className="magazine-card-title">{item.title}</div>
                <div className="muted" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  {item.author?.username || '알 수 없음'}
                  <GradeBadge score={item.author?.garden_score} compact />
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
    </div>
  )
}
