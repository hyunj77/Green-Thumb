import { useEffect, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { fetchGrowthLogs, createGrowthLog, deleteGrowthLog } from '../lib/growthLogs'

export default function GrowthDiary({ plantId, ownerId, currentUserId }) {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [note, setNote] = useState('')
  const [heightCm, setHeightCm] = useState('')
  const [photoUrl, setPhotoUrl] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const isOwner = currentUserId && currentUserId === ownerId

  const load = () => {
    setLoading(true)
    fetchGrowthLogs(plantId).then(({ data }) => {
      setLogs(data || [])
      setLoading(false)
    })
  }

  useEffect(load, [plantId])

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!note.trim()) return
    setSubmitting(true)
    const { data } = await createGrowthLog({
      plantId, authorId: currentUserId, note, heightCm: heightCm ? Number(heightCm) : null, photoUrl,
    })
    setSubmitting(false)
    if (data) {
      setLogs((prev) => [data, ...prev])
      setNote(''); setHeightCm(''); setPhotoUrl('')
    }
  }

  const handleDelete = async (id) => {
    await deleteGrowthLog(id)
    setLogs((prev) => prev.filter((log) => log.id !== id))
  }

  return (
    <div className="growth-diary">
      {isOwner && (
        <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
          <textarea placeholder="오늘의 기록 (예: 새잎 1개 나왔어요!)" rows={2} value={note} onChange={(e) => setNote(e.target.value)} required />
          <div style={{ display: 'flex', gap: 8 }}>
            <input type="number" placeholder="키(cm)" step="0.1" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} style={{ width: 100 }} />
            <input type="url" placeholder="사진 URL (선택)" value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} />
          </div>
          <button type="submit" disabled={submitting} style={{ alignSelf: 'flex-start' }}>{submitting ? '기록 중...' : '기록 추가'}</button>
        </form>
      )}

      {loading ? (
        <p className="muted">불러오는 중...</p>
      ) : logs.length === 0 ? (
        <p className="muted">아직 성장 기록이 없어요.</p>
      ) : (
        <div className="growth-timeline">
          {logs.map((log) => (
            <div key={log.id} className="growth-timeline-item">
              <div className="growth-timeline-dot" />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="muted">{new Date(log.log_date).toLocaleDateString('ko-KR')}{log.height_cm ? ` · 키 ${log.height_cm}cm` : ''}</span>
                  {isOwner && (
                    <button className="secondary" style={{ padding: '1px 8px' }} onClick={() => handleDelete(log.id)}>
                      <Trash2 size={11} />
                    </button>
                  )}
                </div>
                {log.photo_url && <img src={log.photo_url} alt="" style={{ width: '100%', maxWidth: 220, borderRadius: 10, margin: '6px 0' }} />}
                <p style={{ margin: '2px 0 0' }}>{log.note}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
