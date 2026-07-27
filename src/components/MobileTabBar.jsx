import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { House, MessageSquare, PenSquare, Plus, Sprout, Stethoscope, User, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const LEFT_TABS = [
  { to: '/', label: '홈', Icon: House, match: (p) => p === '/' },
  { to: '/community', label: '커뮤니티', Icon: MessageSquare, match: (p) => p.startsWith('/community') || p.startsWith('/posts') },
]

const QUICK_ACTIONS = [
  { to: '/garden#ai-preview', label: 'AI 식물 진단', desc: '사진으로 병해충·상태를 확인해요', Icon: Stethoscope, requireAuth: false },
  { to: '/garden#new-plant', label: '식물 등록하기', desc: '새로운 반려식물을 그린 도감에 추가해요', Icon: Sprout, requireAuth: true },
  { to: '/write', label: '글쓰기', desc: '오늘의 이야기를 이웃들과 나눠요', Icon: PenSquare, requireAuth: true },
]

export default function MobileTabBar() {
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const path = location.pathname
  const [open, setOpen] = useState(false)

  const rightTab = { to: '/garden', label: 'Plant', Icon: Sprout, match: (p) => p.startsWith('/garden') }
  const myTab = { to: user ? '/mypage' : '/login', label: 'MY', Icon: User, match: (p) => p.startsWith('/mypage') || p.startsWith('/login') }

  const renderTab = ({ to, label, Icon, match }) => (
    <Link key={label} to={to} className={`gt-tab ${match(path) ? 'gt-tab-active' : ''}`}>
      <Icon size={19} />
      <span>{label}</span>
    </Link>
  )

  const handleAction = (action) => {
    setOpen(false)
    if (action.requireAuth && !user) {
      navigate('/login')
      return
    }
    navigate(action.to)
  }

  return (
    <>
      {open && (
        <div className="gt-sheet-backdrop" onClick={() => setOpen(false)}>
          <div className="gt-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="gt-sheet-handle" />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <h3 style={{ margin: 0, fontSize: 16 }}>빠른 실행</h3>
              <button className="gt-icon-btn" onClick={() => setOpen(false)} aria-label="닫기">
                <X size={18} />
              </button>
            </div>
            {QUICK_ACTIONS.map((action) => (
              <button key={action.to} className="gt-sheet-action" onClick={() => handleAction(action)}>
                <span className="gt-sheet-action-icon"><action.Icon size={20} /></span>
                <span style={{ textAlign: 'left' }}>
                  <span style={{ display: 'block', fontWeight: 700, color: 'var(--text-h)' }}>{action.label}</span>
                  <span className="muted" style={{ fontSize: 12.5 }}>{action.desc}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <nav className="gt-tab-bar">
        {LEFT_TABS.map(renderTab)}
        <button className="gt-tab" aria-label="빠른 실행" onClick={() => setOpen(true)}>
          <span className="gt-tab-greenie">
            <Plus size={26} color="#fff" />
          </span>
          <span style={{ color: '#7c8a76' }}>추가</span>
        </button>
        {renderTab(rightTab)}
        {renderTab(myTab)}
      </nav>
    </>
  )
}
