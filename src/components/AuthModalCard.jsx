import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Leaf, X } from 'lucide-react'

const SOCIAL_BUTTONS = [
  { key: 'kakao', label: '카카오톡', bg: '#FEE500', color: '#391B1B', text: '💬' },
  { key: 'naver', label: '네이버', bg: '#03C75A', color: '#fff', text: 'N' },
  { key: 'facebook', label: '페이스북', bg: '#1877F2', color: '#fff', text: 'f' },
]

export default function AuthModalCard({ activeTab, children }) {
  const [notice, setNotice] = useState('')

  const handleSocialClick = (label) => {
    setNotice(`${label} 로그인은 아직 준비 중이에요. 이메일로 로그인해주세요!`)
    setTimeout(() => setNotice(''), 3000)
  }

  return (
    <div className="auth-modal-wrap">
      <div className="card auth-card auth-modal-card">
        <Link to="/" className="auth-modal-close" aria-label="닫기"><X size={18} /></Link>

        <div className="auth-modal-brand">
          <Leaf size={22} />
          Green Thumb
        </div>

        <div className="auth-tab-row">
          <Link to="/login" className={`auth-tab ${activeTab === 'login' ? 'auth-tab-active' : ''}`}>회원 로그인</Link>
          <Link to="/signup" className={`auth-tab ${activeTab === 'signup' ? 'auth-tab-active' : ''}`}>회원가입</Link>
        </div>

        {children}

        <div className="auth-social-row">
          {SOCIAL_BUTTONS.map(({ key, label, bg, color, text }) => (
            <button
              key={key}
              type="button"
              className="auth-social-btn"
              style={{ background: bg, color }}
              aria-label={label}
              onClick={() => handleSocialClick(label)}
            >
              {text}
            </button>
          ))}
        </div>
        {notice && <p className="muted" style={{ textAlign: 'center', marginTop: 10 }}>{notice}</p>}
      </div>
    </div>
  )
}
