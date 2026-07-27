import { Link, useLocation } from 'react-router-dom'
import { House, MessageSquare, Sprout, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const LEFT_TABS = [
  { to: '/', label: '홈', Icon: House, match: (p) => p === '/' },
  { to: '/community', label: '커뮤니티', Icon: MessageSquare, match: (p) => p.startsWith('/community') || p.startsWith('/posts') },
]

export default function MobileTabBar() {
  const { user } = useAuth()
  const location = useLocation()
  const path = location.pathname

  const rightTab = { to: '/garden', label: 'Plant', Icon: Sprout, match: (p) => p.startsWith('/garden') }
  const myTab = { to: user ? '/mypage' : '/login', label: 'MY', Icon: User, match: (p) => p.startsWith('/mypage') || p.startsWith('/login') }

  const renderTab = ({ to, label, Icon, match }) => (
    <Link key={label} to={to} className={`gt-tab ${match(path) ? 'gt-tab-active' : ''}`}>
      <Icon size={19} />
      <span>{label}</span>
    </Link>
  )

  return (
    <nav className="gt-tab-bar">
      {LEFT_TABS.map(renderTab)}
      <Link to={user ? '/greenie' : '/login'} className="gt-tab" aria-label="그린이">
        <span className="gt-tab-greenie">
          <Sprout size={24} color="#fff" />
        </span>
        <span style={{ color: path.startsWith('/greenie') ? '#00966f' : '#7c8a76' }}>그린이</span>
      </Link>
      {renderTab(rightTab)}
      {renderTab(myTab)}
    </nav>
  )
}
