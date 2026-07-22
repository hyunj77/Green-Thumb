import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { MapPin, Plus } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import {
  fetchListings, createListing,
  MARKET_CATEGORIES, MARKET_CATEGORY_LABEL,
  DEAL_TYPES, DEAL_TYPE_LABEL,
  REGIONS,
} from '../lib/marketplace'

export default function Marketplace() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const category = searchParams.get('category') || ''
  const region = searchParams.get('region') || ''
  const dealType = searchParams.get('deal') || ''

  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [formCategory, setFormCategory] = useState(MARKET_CATEGORIES[0])
  const [formDealType, setFormDealType] = useState(DEAL_TYPES[0])
  const [formRegion, setFormRegion] = useState(REGIONS[0])
  const [price, setPrice] = useState(0)
  const [locationText, setLocationText] = useState('')
  const [imageUrl, setImageUrl] = useState('')

  const load = () => {
    setLoading(true)
    fetchListings({ category: category || undefined, region: region || undefined, dealType: dealType || undefined }).then(({ data }) => {
      setListings(data || [])
      setLoading(false)
    })
  }

  useEffect(load, [category, region, dealType])

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value); else next.delete(key)
    setSearchParams(next)
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    const { data } = await createListing({
      sellerId: user.id, title, description, category: formCategory, dealType: formDealType,
      price: Number(price), region: formRegion, locationText, imageUrl,
    })
    if (data) load()
    setTitle(''); setDescription(''); setPrice(0); setLocationText(''); setImageUrl(''); setShowForm(false)
  }

  return (
    <div style={{ padding: '0 20px 40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>🪴 로컬 장터</h2>
        {user && (
          <button onClick={() => setShowForm((v) => !v)}>
            <Plus size={14} /> 매물 등록
          </button>
        )}
      </div>

      <div className="card market-filter-card">
        <div className="board-group">
          <div className="board-group-title">거래 유형</div>
          <div className="chip-row" style={{ marginTop: 0 }}>
            <button className={`chip ${dealType === '' ? 'chip-active' : ''}`} onClick={() => updateParam('deal', '')}>전체</button>
            {DEAL_TYPES.map((type) => (
              <button key={type} className={`chip ${dealType === type ? 'chip-active' : ''}`} onClick={() => updateParam('deal', type)}>
                {DEAL_TYPE_LABEL[type]}
              </button>
            ))}
          </div>
        </div>

        <div className="board-group">
          <div className="board-group-title">지역</div>
          <div className="chip-row" style={{ marginTop: 0 }}>
            <button className={`chip ${region === '' ? 'chip-active' : ''}`} onClick={() => updateParam('region', '')}>전체 지역</button>
            {REGIONS.map((r) => (
              <button key={r} className={`chip ${region === r ? 'chip-active' : ''}`} onClick={() => updateParam('region', r)}>
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="board-group">
          <div className="board-group-title">식물 종류</div>
          <div className="chip-row" style={{ marginTop: 0 }}>
            <button className={`chip ${category === '' ? 'chip-active' : ''}`} onClick={() => updateParam('category', '')}>전체</button>
            {MARKET_CATEGORIES.map((cat) => (
              <button key={cat} className={`chip ${category === cat ? 'chip-active' : ''}`} onClick={() => updateParam('category', cat)}>
                {MARKET_CATEGORY_LABEL[cat]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="card" style={{ padding: 24, margin: '20px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <select value={formDealType} onChange={(e) => setFormDealType(e.target.value)}>
              {DEAL_TYPES.map((type) => <option key={type} value={type}>{DEAL_TYPE_LABEL[type]}</option>)}
            </select>
            <select value={formCategory} onChange={(e) => setFormCategory(e.target.value)}>
              {MARKET_CATEGORIES.map((cat) => <option key={cat} value={cat}>{MARKET_CATEGORY_LABEL[cat]}</option>)}
            </select>
          </div>
          <input type="text" placeholder="제목" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <textarea placeholder="상세 설명" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
          {formDealType !== 'free' && (
            <input type="number" placeholder="가격" min={0} value={price} onChange={(e) => setPrice(e.target.value)} />
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <select value={formRegion} onChange={(e) => setFormRegion(e.target.value)}>
              {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            <input type="text" placeholder="상세 지역 (예: 마포구)" value={locationText} onChange={(e) => setLocationText(e.target.value)} />
          </div>
          <input type="url" placeholder="이미지 URL (선택 사항)" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
          <button type="submit">등록하기</button>
        </form>
      )}

      {loading ? (
        <p className="muted">불러오는 중...</p>
      ) : listings.length === 0 ? (
        <p className="muted">조건에 맞는 매물이 없어요.</p>
      ) : (
        <div className="magazine-feed">
          {listings.map((item) => (
            <div key={item.id} className="magazine-card">
              <div className="magazine-card-media">
                {item.image_url ? <img src={item.image_url} alt="" /> : <div className="magazine-card-media-placeholder">🪴</div>}
              </div>
              <div className="magazine-card-body">
                <span className="badge">{DEAL_TYPE_LABEL[item.deal_type] || '판매'}</span>
                <span className="badge" style={{ marginLeft: 6 }}>{MARKET_CATEGORY_LABEL[item.category]}</span>
                {item.status !== 'available' && <span className="badge" style={{ marginLeft: 6 }}>{item.status === 'sold' ? '거래완료' : '예약중'}</span>}
                <div className="magazine-card-title">{item.title}</div>
                {item.deal_type !== 'free' && (
                  <div style={{ fontWeight: 700, color: 'var(--accent)' }}>{item.price > 0 ? `${item.price.toLocaleString()}원` : '가격 협의'}</div>
                )}
                {(item.region || item.location_text) && (
                  <div className="muted"><MapPin size={12} style={{ verticalAlign: -1 }} /> {item.region}{item.location_text ? ` · ${item.location_text}` : ''}</div>
                )}
                <div className="muted">{item.seller?.username || '알 수 없음'}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
