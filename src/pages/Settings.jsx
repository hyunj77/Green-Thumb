import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Laptop, Moon, Settings as SettingsIcon, Sun } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { getStoredTheme, setTheme } from '../lib/theme'
import BackHeader from '../components/BackHeader'

const THEME_OPTIONS = [
  { key: 'light', label: '라이트', Icon: Sun },
  { key: 'dark', label: '다크', Icon: Moon },
  { key: 'system', label: '시스템', Icon: Laptop },
]

export default function Settings() {
  const { user, updatePassword, signOut } = useAuth()
  const navigate = useNavigate()

  const [theme, setThemeState] = useState(() => getStoredTheme() || 'system')

  const [newPassword, setNewPassword] = useState('')
  const [pwSaving, setPwSaving] = useState(false)
  const [pwMessage, setPwMessage] = useState('')
  const [pwError, setPwError] = useState('')

  const [confirmText, setConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  if (!user) return null

  const handleThemeChange = (key) => {
    setThemeState(key)
    setTheme(key === 'system' ? null : key)
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setPwError('')
    setPwMessage('')
    if (newPassword.length < 6) {
      setPwError('비밀번호는 6자 이상이어야 해요.')
      return
    }
    setPwSaving(true)
    const { error } = await updatePassword(newPassword)
    setPwSaving(false)
    if (error) {
      setPwError('변경에 실패했어요: ' + error.message)
      return
    }
    setPwMessage('비밀번호가 변경됐어요.')
    setNewPassword('')
  }

  const handleDeleteData = async () => {
    if (confirmText !== '탈퇴합니다' || deleting) return
    setDeleting(true)
    setDeleteError('')
    const { error } = await supabase.from('profiles').delete().eq('id', user.id)
    setDeleting(false)
    if (error) {
      setDeleteError('삭제에 실패했어요: ' + error.message)
      return
    }
    await signOut()
    navigate('/')
  }

  return (
    <div style={{ padding: '0 20px 60px', maxWidth: 560, margin: '0 auto' }}>
      <BackHeader title={<><SettingsIcon size={18} style={{ verticalAlign: -3, marginRight: 6 }} />계정 설정</>} />

      <div className="card" style={{ padding: '24px 28px', marginBottom: 20 }}>
        <h3 style={{ marginTop: 0 }}>화면 테마</h3>
        <div className="theme-toggle-row">
          {THEME_OPTIONS.map(({ key, label, Icon }) => (
            <button
              key={key}
              type="button"
              className={theme === key ? '' : 'secondary'}
              onClick={() => handleThemeChange(key)}
            >
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>
      </div>

      <div className="card" style={{ padding: '24px 28px', marginBottom: 20 }}>
        <h3 style={{ marginTop: 0 }}>비밀번호 변경</h3>
        <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            type="password"
            placeholder="새 비밀번호 (6자 이상)"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          {pwError && <p className="error-text" style={{ margin: 0 }}>{pwError}</p>}
          {pwMessage && <p className="muted" style={{ margin: 0, color: 'var(--accent)', fontWeight: 700 }}>{pwMessage}</p>}
          <button type="submit" disabled={pwSaving} style={{ alignSelf: 'flex-start' }}>
            {pwSaving ? '변경 중...' : '비밀번호 변경'}
          </button>
        </form>
      </div>

      <div className="card" style={{ padding: '24px 28px', border: '1px solid var(--red, #e0a0a0)' }}>
        <h3 style={{ marginTop: 0, color: '#b3311f' }}>내 데이터 삭제</h3>
        <p className="muted" style={{ marginTop: 0 }}>
          등록한 식물, 게시글, 댓글, 메시지 등 계정에 연결된 모든 데이터가 삭제돼요. 되돌릴 수 없어요.
        </p>
        <p className="muted" style={{ fontSize: 12.5 }}>
          ※ 로그인 정보(이메일/비밀번호) 자체를 완전히 없애려면 별도 절차가 필요해요. 데이터 삭제 후 로그인이 필요하시면 문의해주세요.
        </p>
        <label className="muted" style={{ display: 'block', marginTop: 12 }}>
          확인을 위해 "탈퇴합니다"를 입력해주세요
          <input type="text" value={confirmText} onChange={(e) => setConfirmText(e.target.value)} placeholder="탈퇴합니다" />
        </label>
        {deleteError && <p className="error-text">{deleteError}</p>}
        <button
          className="secondary"
          style={{ marginTop: 12, borderColor: '#b3311f', color: '#b3311f' }}
          disabled={confirmText !== '탈퇴합니다' || deleting}
          onClick={handleDeleteData}
        >
          {deleting ? '삭제 중...' : '내 데이터 영구 삭제'}
        </button>
      </div>
    </div>
  )
}
