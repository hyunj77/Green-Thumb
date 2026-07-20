import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { createPost, updatePost, fetchPostById, CATEGORIES, CATEGORY_GROUPS, CATEGORY_LABEL } from '../lib/posts'
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
  const [plants, setPlants] = useState([])
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

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
      })
    }
  }, [mode, id])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    const payload = { title, content, category, imageUrl, plantId: plantId || null }
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
    <div className="card" style={{ maxWidth: 640, margin: '32px auto', padding: '32px 36px' }}>
      <h2>{mode === 'edit' ? '게시물 수정' : '새 글쓰기'}</h2>
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

        <input type="text" placeholder="제목" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <textarea placeholder="내용을 입력하세요" rows={8} value={content} onChange={(e) => setContent(e.target.value)} required />
        <input type="url" placeholder="이미지 URL (선택 사항)" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />

        {error && <p className="error-text">{error}</p>}
        <button type="submit" disabled={submitting}>{submitting ? '저장 중...' : '등록하기'}</button>
      </form>
    </div>
  )
}
