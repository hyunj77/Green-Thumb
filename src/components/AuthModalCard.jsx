import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Leaf, X } from 'lucide-react'

function KakaoMark() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18">
      <path
        fill="#391B1B"
        d="M12 3.5C6.75 3.5 2.5 6.86 2.5 11c0 2.66 1.77 5 4.44 6.32-.2.72-.71 2.58-.81 2.98-.13.5.18.49.38.36.16-.1 2.5-1.7 3.51-2.39.63.09 1.28.14 1.98.14 5.25 0 9.5-3.36 9.5-7.5S17.25 3.5 12 3.5Z"
      />
      <ellipse cx="7.6" cy="19.2" rx="1" ry="0.6" fill="#391B1B" transform="rotate(-25 7.6 19.2)" />
    </svg>
  )
}

function NaverMark() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16">
      <path fill="#fff" d="M14.4 3v9.2L9.6 3H3v18h6.6v-9.2L14.4 21H21V3z" />
    </svg>
  )
}

function FacebookMark() {
  return (
    <svg viewBox="0 0 24 24" width="12" height="20">
      <path fill="#fff" d="M15 3h-2.5C10.02 3 8.5 4.79 8.5 7.5V10H6v4h2.5v10h4V14H15l.7-4h-3.2V7.8c0-1.05.55-1.55 1.6-1.55H15V3Z" />
    </svg>
  )
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20">
      <path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.63h6.47c-.28 1.5-1.13 2.77-2.4 3.63v3.02h3.89c2.27-2.09 3.58-5.17 3.58-8.83Z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.95-2.9l-3.89-3.02c-1.08.72-2.46 1.15-4.06 1.15-3.12 0-5.77-2.11-6.71-4.94H1.27v3.11C3.25 21.3 7.31 24 12 24Z" />
      <path fill="#FBBC05" d="M5.29 14.29A7.2 7.2 0 0 1 4.9 12c0-.8.14-1.57.39-2.29V6.6H1.27A11.98 11.98 0 0 0 0 12c0 1.94.46 3.77 1.27 5.4l4.02-3.11Z" />
      <path fill="#EA4335" d="M12 4.77c1.76 0 3.34.61 4.58 1.79l3.44-3.44C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.7 1.27 6.6l4.02 3.11c.94-2.83 3.59-4.94 6.71-4.94Z" />
    </svg>
  )
}

const SOCIAL_BUTTONS = [
  { key: 'kakao', label: '카카오톡', bg: '#FEE500', Mark: KakaoMark },
  { key: 'naver', label: '네이버', bg: '#03C75A', Mark: NaverMark },
  { key: 'facebook', label: '페이스북', bg: '#1877F2', Mark: FacebookMark },
  { key: 'google', label: '구글', bg: '#fff', border: true, Mark: GoogleMark },
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

        <p className="auth-social-caption">SNS 계정으로 간편 로그인</p>
        <div className="auth-social-row">
          {SOCIAL_BUTTONS.map(({ key, label, bg, border, Mark }) => (
            <button
              key={key}
              type="button"
              className={`auth-social-btn ${border ? 'auth-social-btn-border' : ''}`}
              style={{ background: bg }}
              aria-label={label}
              onClick={() => handleSocialClick(label)}
            >
              <Mark />
            </button>
          ))}
        </div>
        {notice && <p className="muted" style={{ textAlign: 'center', marginTop: 10 }}>{notice}</p>}
      </div>
    </div>
  )
}
