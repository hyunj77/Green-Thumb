import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Send } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { fetchConversations, fetchMessagesWith, sendMessage } from '../lib/messages'
import { supabase } from '../lib/supabase'
import { timeAgo } from '../lib/time'

export default function Messages() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const activePartnerId = searchParams.get('with') || ''

  const [conversations, setConversations] = useState([])
  const [activePartner, setActivePartner] = useState(null)
  const [thread, setThread] = useState([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const bottomRef = useRef(null)

  useEffect(() => {
    if (!user) return
    fetchConversations(user.id).then(({ data }) => {
      setConversations(data)
      setLoading(false)
    })
  }, [user])

  useEffect(() => {
    if (!user || !activePartnerId) return
    fetchMessagesWith(user.id, activePartnerId).then(({ data }) => setThread(data))
    supabase.from('profiles').select('id, username').eq('id', activePartnerId).single().then(({ data }) => setActivePartner(data))
  }, [user, activePartnerId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [thread])

  const openConversation = (partnerId) => setSearchParams({ with: partnerId })

  const handleSend = async (e) => {
    e.preventDefault()
    if (!text.trim() || !activePartnerId) return
    const { data } = await sendMessage({ senderId: user.id, recipientId: activePartnerId, content: text.trim() })
    if (data) setThread((prev) => [...prev, data])
    setText('')
    fetchConversations(user.id).then(({ data }) => setConversations(data))
  }

  if (!user) return <p className="muted" style={{ padding: 20 }}>쪽지를 보려면 <Link to="/login">로그인</Link>이 필요해요.</p>

  return (
    <div style={{ padding: '0 20px 60px' }}>
      <h2 style={{ marginTop: 20 }}>💌 쪽지함</h2>

      <div className="messages-layout">
        <div className="messages-conv-list">
          {loading ? (
            <p className="muted">불러오는 중...</p>
          ) : conversations.length === 0 ? (
            <p className="muted">아직 주고받은 쪽지가 없어요.</p>
          ) : (
            conversations.map(({ partner, lastMessage }) => (
              <button
                key={partner.id}
                type="button"
                className={`messages-conv-item ${activePartnerId === String(partner.id) ? 'messages-conv-item-active' : ''}`}
                onClick={() => openConversation(partner.id)}
              >
                <span className="avatar-circle">{partner.username?.[0] || '?'}</span>
                <div style={{ minWidth: 0, textAlign: 'left' }}>
                  <div style={{ fontWeight: 700 }}>{partner.username}</div>
                  <div className="muted" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lastMessage.content}</div>
                </div>
              </button>
            ))
          )}
        </div>

        <div className="messages-thread">
          {!activePartnerId ? (
            <p className="muted" style={{ padding: 20 }}>왼쪽에서 대화 상대를 선택해주세요.</p>
          ) : (
            <>
              <div className="messages-thread-head">{activePartner?.username || '...'}</div>
              <div className="messages-thread-body">
                {thread.map((m) => (
                  <div key={m.id} className={`message-bubble ${m.sender_id === user.id ? 'message-bubble-mine' : ''}`}>
                    <div>{m.content}</div>
                    <span className="muted" style={{ fontSize: 11 }}>{timeAgo(m.created_at)}</span>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
              <form onSubmit={handleSend} className="messages-thread-form">
                <input type="text" placeholder="메시지를 입력하세요" value={text} onChange={(e) => setText(e.target.value)} />
                <button type="submit"><Send size={16} /></button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
