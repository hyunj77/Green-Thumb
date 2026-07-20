import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

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
      <div className="card auth-card" style={{ maxWidth: 420, margin: '56px auto', padding: '36px 40px', textAlign: 'center' }}>
        <h2>가입 완료 🌱</h2>
        <p className="muted">받은편지함에서 인증 메일을 확인한 뒤 로그인해주세요.</p>
        <Link to="/login"><button style={{ marginTop: 12 }}>로그인 하러가기</button></Link>
      </div>
    )
  }

  return (
    <div className="card auth-card" style={{ maxWidth: 420, margin: '56px auto', padding: '36px 40px' }}>
      <h2>회원가입</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <input
          type="text"
          placeholder="닉네임"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="비밀번호 (6자 이상)"
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="error-text">{error}</p>}
        <button type="submit" disabled={submitting}>{submitting ? '가입 중...' : '회원가입'}</button>
      </form>
    </div>
  )
}
