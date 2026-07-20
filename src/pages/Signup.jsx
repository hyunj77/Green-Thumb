import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AuthModalCard from '../components/AuthModalCard'

export default function Signup() {
  const { signUp } = useAuth()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    const { error } = await signUp({ email, password, username })
    setSubmitting(false)
    if (error) {
      setError(error.message === 'User already registered'
        ? '이미 가입된 이메일입니다.'
        : error.message)
      return
    }
    setDone(true)
  }

  if (done) {
    return (
      <div className="auth-modal-wrap">
        <div className="card auth-card auth-modal-card" style={{ textAlign: 'center' }}>
          <h2>가입 완료 🌱</h2>
          <p className="muted">받은편지함에서 인증 메일을 확인한 뒤 로그인해주세요.</p>
          <Link to="/login"><button style={{ marginTop: 12 }}>로그인 하러가기</button></Link>
        </div>
      </div>
    )
  }

  return (
    <AuthModalCard activeTab="signup">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div>
          <input
            type="text"
            placeholder="닉네임"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <p className="auth-hint">커뮤니티에서 사용할 닉네임이에요</p>
        </div>
        <div>
          <input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <p className="auth-hint">로그인 시 아이디로 사용돼요</p>
        </div>
        <div>
          <input
            type="password"
            placeholder="비밀번호"
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <p className="auth-hint">6자 이상 입력해주세요</p>
        </div>
        {error && <p className="error-text">{error}</p>}
        <button type="submit" disabled={submitting} style={{ width: '100%', justifyContent: 'center', marginTop: 6 }}>
          {submitting ? '가입 중...' : '회원가입'}
        </button>
      </form>
    </AuthModalCard>
  )
}
