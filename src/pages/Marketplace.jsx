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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className={category === '' ? '' : 'secondary'} onClick={() => goCategory('')}>전체</button>
          {MARKET_CATEGORIES.map((cat) => (
            <button key={cat} className={category === cat ? '' : 'secondary'} onClick={() => goCategory(cat)}>
              {MARKET_CATEGORY_LABEL[cat]}
            </button>
          ))}
        </div>
        {user && <button onClick={() => setShowForm((v) => !v)}><Plus size={16} /> 판매 등록</button>}
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="card" style={{ padding: 24, marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
          {listings.map((item) => (
            <div key={item.id} className="card" style={{ padding: 18 }}>
              {item.image_url && <img src={item.image_url} alt="" style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 12, marginBottom: 10 }} />}
              <span className="badge blue">{MARKET_CATEGORY_LABEL[item.category]}</span>
              {item.status !== 'available' && <span className="badge" style={{ marginLeft: 6 }}>{item.status === 'sold' ? '거래완료' : '예약중'}</span>}
              <div style={{ fontWeight: 700, color: 'var(--text-h)', marginTop: 8 }}>{item.title}</div>
              <div style={{ fontWeight: 700 }}>{item.price > 0 ? `${item.price.toLocaleString()}원` : '나눔'}</div>
              {item.location_text && (
                <div className="muted"><MapPin size={12} style={{ verticalAlign: -1 }} /> {item.location_text}</div>
              )}
              <div className="muted">{item.seller?.username || '알 수 없음'}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
