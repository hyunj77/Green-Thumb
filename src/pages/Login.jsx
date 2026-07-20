import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
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

  return (
    <div className="card auth-card" style={{ maxWidth: 420, margin: '56px auto', padding: '36px 40px' }}>
      <h2>로그인</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="error-text">{error}</p>}
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit" disabled={submitting} style={{ flex: 1 }}>{submitting ? '로그인 중...' : '로그인'}</button>
          <Link to="/signup" style={{ flex: 1 }}>
            <button type="button" className="secondary" style={{ width: '100%' }}>회원가입</button>
          </Link>
        </div>
      </form>
    </div>
  )
}
