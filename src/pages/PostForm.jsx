import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import BackHeader from '../components/BackHeader'
import ImageUploadField from '../components/ImageUploadField'
import { createPost, updatePost, fetchPostById, CATEGORIES, CATEGORY_GROUPS, CATEGORY_LABEL, isMarketCategory } from '../lib/posts'
import { fetchMyPlants } from '../lib/plants'

export default function PostForm({ mode }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { id } = useParams()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [imageUrl, setImageUrl] = useState('')
  const [plantId, setPlantId] = useState('')
  const [price, setPrice] = useState('')
  const [plants, setPlants] = useState([])
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const isMarket = isMarketCategory(category)
  const needsPrice = isMarket && category !== 'market_free'

  useEffect(() => {
    fetchMyPlants(user.id).then(({ data }) => setPlants(data || []))
  }, [user.id])

  useEffect(() => {
    if (mode === 'edit' && id) {
      fetchPostById(id).then(({ data }) => {
        if (!data) return
        setTitle(data.title)
        setContent(data.content || '')
        setCategory(data.category)
        setImageUrl(data.image_url || '')
        setPlantId(data.plant_id ? String(data.plant_id) : '')
        setPrice(data.price != null ? String(data.price) : '')
      })
    }
  }, [mode, id])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    const payload = { title, content, category, imageUrl, plantId: plantId || null, price }
    const { error } = mode === 'edit'
      ? await updatePost(id, payload)
      : await createPost({ ...payload, authorId: user.id })

    setSubmitting(false)
    if (error) {
      setError('저장에 실패했어요: ' + error.message)
      return
    }
    navigate(mode === 'edit' ? `/posts/${id}` : '/')
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 20px 40px' }}>
      <BackHeader title={mode === 'edit' ? '게시물 수정' : '새 글쓰기'} />
      <div className="card" style={{ padding: '32px 36px' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {CATEGORY_GROUPS.map((group) => (
            <optgroup key={group.title} label={group.title}>
              {group.categories.map((cat) => <option key={cat} value={cat}>{CATEGORY_LABEL[cat]}</option>)}
            </optgroup>
          ))}
        </select>

        {plants.length > 0 && (
          <select value={plantId} onChange={(e) => setPlantId(e.target.value)}>
            <option value="">연결할 식물 선택 (선택 사항)</option>
            {plants.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        )}

        <input type="text" placeholder={isMarket ? '무엇을 거래하시나요? (예: 몬스테라 알보 화분)' : '제목'} value={title} onChange={(e) => setTitle(e.target.value)} required />

        {needsPrice && (
          <label className="muted">
            가격 (원)
            <input
              type="number"
              min={0}
              placeholder="가격을 입력하세요"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </label>
        )}
        {isMarket && category === 'market_free' && (
          <p className="muted" style={{ margin: 0, fontSize: 12.5 }}>🎁 나눔은 무료로 등록돼요.</p>
        )}

        <textarea
          placeholder={isMarket ? '상태, 거래 방법, 원하는 지역 등을 자유롭게 적어주세요' : '내용을 입력하세요'}
          rows={8}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
        <ImageUploadField folder="posts" userId={user.id} value={imageUrl} onChange={setImageUrl} />

        {error && <p className="error-text">{error}</p>}
        <button type="submit" disabled={submitting}>{submitting ? '저장 중...' : '등록하기'}</button>
      </form>
      </div>
    </div>
  )
}
