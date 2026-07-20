import { useEffect, useState } from 'react'
import { Droplets, NotebookPen, Plus, Trash2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { fetchMyPlants, createPlant, waterPlant, deletePlant, nextWateringDate } from '../lib/plants'
import GrowthDiary from '../components/GrowthDiary'
import AiFeaturePreview from '../components/AiFeaturePreview'

export default function MyGarden() {
  const { user } = useAuth()
  const [plants, setPlants] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [species, setSpecies] = useState('')
  const [photoUrl, setPhotoUrl] = useState('')
  const [interval, setInterval_] = useState(7)
  const [expandedId, setExpandedId] = useState(null)

  const load = () => {
    if (!user) return setLoading(false)
    setLoading(true)
    fetchMyPlants(user.id).then(({ data }) => {
      setPlants(data || [])
      setLoading(false)
    })
  }

  useEffect(load, [user])

  const handleAdd = async (e) => {
    e.preventDefault()
    const { data } = await createPlant({ ownerId: user.id, name, species, photoUrl, wateringIntervalDays: Number(interval) })
    if (data) setPlants((prev) => [data, ...prev])
    setName(''); setSpecies(''); setPhotoUrl(''); setInterval_(7); setShowForm(false)
  }

  const handleWater = async (id) => {
    const { data } = await waterPlant(id)
    if (data) setPlants((prev) => prev.map((p) => (p.id === id ? data : p)))
  }

  const handleDelete = async (id) => {
    if (!confirm('이 식물 기록을 삭제할까요?')) return
    await deletePlant(id)
    setPlants((prev) => prev.filter((p) => p.id !== id))
  }

  if (!user) return <p className="muted" style={{ padding: 20 }}>마이 그린 도감을 보려면 로그인이 필요해요.</p>

  return (
    <div style={{ padding: '0 20px 40px', maxWidth: 720, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ margin: 0 }}>🌿 마이 그린 도감</h2>
        <button onClick={() => setShowForm((v) => !v)}><Plus size={16} /> 식물 등록</button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="card" style={{ padding: 24, marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input type="text" placeholder="식물 이름 (예: 몬스테라)" value={name} onChange={(e) => setName(e.target.value)} required />
          <input type="text" placeholder="품종 (선택 사항)" value={species} onChange={(e) => setSpecies(e.target.value)} />
          <input type="url" placeholder="사진 URL (선택 사항)" value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} />
          <label className="muted">
            물주기 주기 (일)
            <input type="number" min={1} value={interval} onChange={(e) => setInterval_(e.target.value)} />
          </label>
          <button type="submit">등록</button>
        </form>
      )}

      {loading ? (
        <p className="muted">불러오는 중...</p>
      ) : plants.length === 0 ? (
        <p className="muted">등록된 식물이 없어요. 첫 반려식물을 등록해보세요!</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
          {plants.map((plant) => {
            const next = nextWateringDate(plant)
            const dueSoon = next && next <= new Date()
            return (
              <div key={plant.id} className="card" style={{ padding: 18 }}>
                {plant.photo_url && <img src={plant.photo_url} alt="" style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 12, marginBottom: 10 }} />}
                <div style={{ fontWeight: 700, color: 'var(--text-h)' }}>{plant.name}</div>
                {plant.species && <div className="muted">{plant.species}</div>}
                <div className="muted" style={{ marginTop: 6 }}>
                  마지막 물주기: {plant.last_watered_at || '기록 없음'}
                </div>
                {next && (
                  <div className={dueSoon ? 'error-text' : 'muted'}>
                    다음 물주기: {next.toLocaleDateString('ko-KR')} {dueSoon && '💧 필요해요!'}
                  </div>
                )}
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <button onClick={() => handleWater(plant.id)} style={{ flex: 1 }}><Droplets size={14} /> 물 줬어요</button>
                  <button className="secondary" onClick={() => setExpandedId(expandedId === plant.id ? null : plant.id)}>
                    <NotebookPen size={14} />
                  </button>
                  <button className="secondary" onClick={() => handleDelete(plant.id)}><Trash2 size={14} /></button>
                </div>

                {expandedId === plant.id && (
                  <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
                    <div className="contact-row-label" style={{ marginBottom: 8 }}>🌱 성장일기</div>
                    <GrowthDiary plantId={plant.id} ownerId={plant.owner_id} currentUserId={user.id} />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <AiFeaturePreview />
    </div>
  )
}
