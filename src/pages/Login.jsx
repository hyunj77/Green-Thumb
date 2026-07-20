import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { setRememberMe } from '../lib/supabase'
import AuthModalCard from '../components/AuthModalCard'

export default function Login() {
  const { signIn, sendPasswordReset } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [remember, setRemember] = useState(true)

  const [showForgot, setShowForgot] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotStatus, setForgotStatus] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    setRememberMe(remember)
    const { error } = await signIn({ email, password })
    setSubmitting(false)
    if (error) {
      setError(error.message === 'Email not confirmed'
        ? '이메일 인증이 완료되지 않았습니다. 받은편지함의 인증 메일을 확인해주세요.'
        : '이메일 또는 비밀번호가 올바르지 않습니다.')
      return
    }
    navigate('/')
  }

  const handleForgotSubmit = async (e) => {
    e.preventDefault()
    setForgotStatus('전송 중...')
    const { error } = await sendPasswordReset(forgotEmail)
    setForgotStatus(error ? '전송에 실패했어요. 이메일 주소를 확인해주세요.' : '재설정 링크를 이메일로 보냈어요. 받은편지함을 확인해주세요!')
  }

  return (
    <AuthModalCard activeTab="login">
      {showForgot ? (
        <form onSubmit={handleForgotSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <p className="muted" style={{ margin: 0 }}>가입하신 이메일로 비밀번호 재설정 링크를 보내드려요.</p>
          <input
            type="email"
            placeholder="이메일"
            value={forgotEmail}
            onChange={(e) => setForgotEmail(e.target.value)}
            required
          />
          {forgotStatus && <p className="muted" style={{ margin: 0 }}>{forgotStatus}</p>}
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" style={{ flex: 1 }}>재설정 링크 보내기</button>
            <button type="button" className="secondary" style={{ flex: 1 }} onClick={() => setShowForgot(false)}>돌아가기</button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div>
            <input
              type="email"
              placeholder="이메일*"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <p className="auth-hint">가입하신 이메일 주소를 입력해주세요</p>
          </div>
          <div>
            <input
              type="password"
              placeholder="비밀번호*"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <p className="auth-hint">6자 이상 입력해주세요</p>
          </div>

          <div className="auth-links-row">
            <label className="auth-remember">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
              자동 로그인
            </label>
            <button type="button" className="auth-link-btn" onClick={() => setShowForgot(true)}>비밀번호 찾기</button>
          </div>

          {error && <p className="error-text">{error}</p>}
          <button type="submit" disabled={submitting} style={{ width: '100%', justifyContent: 'center', marginTop: 6 }}>
            {submitting ? '로그인 중...' : '로그인'}
          </button>
        </form>
      )}
    </AuthModalCard>
  )
}
