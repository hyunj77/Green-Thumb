import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ThumbsUp, Trash2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import {
  MOOD_EMOJIS,
  fetchGuestbookEntries,
  createGuestbookEntry,
  deleteGuestbookEntry,
  fetchStampCounts,
  addStamp,
  removeStamp,
} from '../lib/guestbook'

export default function GuestbookSection() {
  const { user } = useAuth()
  const [entries, setEntries] = useState([])
  const [stamps, setStamps] = useState([])
  const [loading, setLoading] = useState(true)

  const [region, setRegion] = useState('')
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [snsLink, setSnsLink] = useState('')
  const [moodEmoji, setMoodEmoji] = useState(MOOD_EMOJIS[0])
  const [bestPlantTag, setBestPlantTag] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const load = async () => {
    setLoading(true)
    const { data } = await fetchGuestbookEntries()
    const list = data || []
    setEntries(list)
    const { data: stampData } = await fetchStampCounts(list.map((e) => e.id))
    setStamps(stampData || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const countOf = (entryId) => stamps.filter((s) => s.entry_id === entryId).length
  const myStamp = (entryId) => user && stamps.some((s) => s.entry_id === entryId && s.user_id === user.id)

  const toggleStamp = async (entryId) => {
    if (!user) return
    if (myStamp(entryId)) {
      await removeStamp({ entryId, userId: user.id })
    } else {
      await addStamp({ entryId, userId: user.id })
    }
    const { data } = await fetchStampCounts(entries.map((e) => e.id))
    setStamps(data || [])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!message.trim()) return
    setSubmitting(true)
    const { data } = await createGuestbookEntry({
      authorId: user.id, region, message, email, snsLink, moodEmoji, bestPlantTag,
    })
    setSubmitting(false)
    if (data) {
      setEntries((prev) => [data, ...prev])
      setRegion(''); setMessage(''); setEmail(''); setSnsLink(''); setBestPlantTag(''); setMoodEmoji(MOOD_EMOJIS[0])
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('방명록을 삭제할까요?')) return
    await deleteGuestbookEntry(id)
    setEntries((prev) => prev.filter((entry) => entry.id !== id))
  }

  return (
    <section className="guestbook-section">
      <h3>🌿 식물 방명록</h3>
      <p className="muted" style={{ marginBottom: 16 }}>이웃 집사들에게 응원, 질문, 나눔 이야기를 자유롭게 남겨보세요</p>

      {user ? (
        <form onSubmit={handleSubmit} className="contact-card" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            {MOOD_EMOJIS.map((emoji) => (
              <button
                type="button"
                key={emoji}
                className={moodEmoji === emoji ? '' : 'secondary'}
                style={{ padding: '6px 12px', fontSize: 18 }}
                onClick={() => setMoodEmoji(emoji)}
              >
                {emoji}
              </button>
            ))}
          </div>
          <textarea
            placeholder="방명록 메시지 (최대 300자)"
            rows={3}
            maxLength={300}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            style={{ marginBottom: 10 }}
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
            <input type="text" placeholder="거주 지역 (예: 홍대동)" value={region} onChange={(e) => setRegion(e.target.value)} />
            <input type="text" placeholder="베스트 식물 태그 (예: #알보 마니아)" value={bestPlantTag} onChange={(e) => setBestPlantTag(e.target.value)} />
            <input type="url" placeholder="내 식물 SNS 링크 (선택)" value={snsLink} onChange={(e) => setSnsLink(e.target.value)} />
            <input type="email" placeholder="이메일 (비공개, 선택)" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <button type="submit" disabled={submitting}>{submitting ? '남기는 중...' : '방명록 남기기'}</button>
        </form>
      ) : (
        <p className="muted" style={{ marginBottom: 24 }}>
          방명록을 남기려면 <Link to="/login">로그인</Link>이 필요해요.
        </p>
      )}

      {loading ? (
        <p className="muted">불러오는 중...</p>
      ) : entries.length === 0 ? (
        <p className="muted">아직 방명록이 없어요. 첫 흔적을 남겨보세요!</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {entries.map((entry) => (
            <div key={entry.id} className="contact-card guestbook-entry">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <strong style={{ color: 'var(--text-h)' }}>
                    {entry.region ? `${entry.region} 집사 ` : ''}{entry.author?.username || '알 수 없음'}
                  </strong>
                  {entry.mood_emoji && <span style={{ marginLeft: 8 }}>{entry.mood_emoji}</span>}
                </div>
                {user && user.id === entry.author?.id && (
                  <button className="secondary" style={{ padding: '2px 10px' }} onClick={() => handleDelete(entry.id)}>
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
              <p style={{ margin: '8px 0' }}>{entry.message}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  {entry.best_plant_tag && <span className="badge">{entry.best_plant_tag}</span>}
                  {entry.sns_link && <a href={entry.sns_link} target="_blank" rel="noreferrer" className="muted" style={{ marginLeft: 8 }}>내 식물 보러가기 →</a>}
                </div>
                <button className={myStamp(entry.id) ? '' : 'secondary'} style={{ padding: '6px 12px' }} onClick={() => toggleStamp(entry.id)}>
                  <ThumbsUp size={14} /> {countOf(entry.id)}
                </button>
              </div>
              <span className="muted">{new Date(entry.created_at).toLocaleDateString('ko-KR')}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
