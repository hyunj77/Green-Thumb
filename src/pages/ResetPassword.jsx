import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ResetPassword() {
  const { updatePassword } = useAuth()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    const { error } = await updatePassword(password)
    setSubmitting(false)
    if (error) {
      setError('비밀번호 변경에 실패했어요. 재설정 링크를 다시 요청해주세요.')
      return
    }
    setDone(true)
    setTimeout(() => navigate('/login'), 1500)
  }

  return (
    <div className="auth-modal-wrap">
      <div className="card auth-card auth-modal-card" style={{ textAlign: 'center' }}>
        <h2>비밀번호 재설정</h2>
        {done ? (
          <p className="muted">비밀번호가 변경됐어요. 로그인 화면으로 이동할게요...</p>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12, textAlign: 'left' }}>
            <input
              type="password"
              placeholder="새 비밀번호"
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <p className="auth-hint">6자 이상 입력해주세요</p>
            {error && <p className="error-text">{error}</p>}
            <button type="submit" disabled={submitting} style={{ width: '100%', justifyContent: 'center' }}>
              {submitting ? '변경 중...' : '비밀번호 변경'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
