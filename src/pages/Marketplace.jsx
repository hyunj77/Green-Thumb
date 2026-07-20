import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { MapPin, Plus } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { fetchListings, createListing, MARKET_CATEGORIES, MARKET_CATEGORY_LABEL } from '../lib/marketplace'

export default function Marketplace() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const category = searchParams.get('category') || ''

  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [formCategory, setFormCategory] = useState(MARKET_CATEGORIES[0])
  const [price, setPrice] = useState(0)
  const [locationText, setLocationText] = useState('')
  const [imageUrl, setImageUrl] = useState('')

  const load = () => {
    setLoading(true)
    fetchListings({ category: category || undefined }).then(({ data }) => {
      setListings(data || [])
      setLoading(false)
    })
  }

  useEffect(load, [category])

  const goCategory = (cat) => setSearchParams(cat ? { category: cat } : {})

  const handleAdd = async (e) => {
    e.preventDefault()
    const { data } = await createListing({
      sellerId: user.id, title, description, category: formCategory,
      price: Number(price), locationText, imageUrl,
    })
    if (data) load()
    setTitle(''); setDescription(''); setPrice(0); setLocationText(''); setImageUrl(''); setShowForm(false)
  }

  return (
    <div style={{ padding: '0 20px 40px' }}>
      <h2 style={{ marginTop: 20 }}>🪴 로컬 장터</h2>
      <div className="chip-row" style={{ marginTop: 0 }}>
        <button className={`chip ${category === '' ? 'chip-active' : ''}`} onClick={() => goCategory('')}>전체</button>
        {MARKET_CATEGORIES.map((cat) => (
          <button key={cat} className={`chip ${category === cat ? 'chip-active' : ''}`} onClick={() => goCategory(cat)}>
            {MARKET_CATEGORY_LABEL[cat]}
          </button>
        ))}
        {user && (
          <button className="chip chip-write" onClick={() => setShowForm((v) => !v)}>
            <Plus size={14} /> 판매 등록
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="card" style={{ padding: 24, margin: '20px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <select value={formCategory} onChange={(e) => setFormCategory(e.target.value)}>
            {MARKET_CATEGORIES.map((cat) => <option key={cat} value={cat}>{MARKET_CATEGORY_LABEL[cat]}</option>)}
          </select>
          <input type="text" placeholder="제목" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <textarea placeholder="상세 설명" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
          <input type="number" placeholder="가격 (0원이면 나눔)" min={0} value={price} onChange={(e) => setPrice(e.target.value)} />
          <input type="text" placeholder="거래 희망 지역 (예: 서울 마포구)" value={locationText} onChange={(e) => setLocationText(e.target.value)} />
          <input type="url" placeholder="이미지 URL (선택 사항)" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
          <button type="submit">등록하기</button>
        </form>
      )}

      {loading ? (
        <p className="muted">불러오는 중...</p>
      ) : listings.length === 0 ? (
        <p className="muted">등록된 매물이 없어요.</p>
      ) : (
        <div className="magazine-feed">
          {listings.map((item) => (
            <div key={item.id} className="magazine-card">
              <div className="magazine-card-media">
                {item.image_url ? <img src={item.image_url} alt="" /> : <div className="magazine-card-media-placeholder">🪴</div>}
              </div>
              <div className="magazine-card-body">
                <span className="badge">{MARKET_CATEGORY_LABEL[item.category]}</span>
                {item.status !== 'available' && <span className="badge" style={{ marginLeft: 6 }}>{item.status === 'sold' ? '거래완료' : '예약중'}</span>}
                <div className="magazine-card-title">{item.title}</div>
                <div style={{ fontWeight: 700, color: 'var(--accent)' }}>{item.price > 0 ? `${item.price.toLocaleString()}원` : '나눔'}</div>
                {item.location_text && (
                  <div className="muted"><MapPin size={12} style={{ verticalAlign: -1 }} /> {item.location_text}</div>
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
