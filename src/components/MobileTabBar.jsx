import { Link, useLocation } from 'react-router-dom'
import { House, MessageSquare, Newspaper, Plus, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const LEFT_TABS = [
  { to: '/', label: '홈', Icon: House, match: (p) => p === '/' },
  { to: '/community', label: '피드', Icon: Newspaper, match: (p) => p.startsWith('/community') || p.startsWith('/posts') },
]

const RIGHT_TABS = [
  { to: '/messages', label: '채팅', Icon: MessageSquare, match: (p) => p.startsWith('/messages') },
]

export default function MobileTabBar() {
  const { user } = useAuth()
  const location = useLocation()
  const myTab = { to: user ? '/mypage' : '/login', label: 'MY', Icon: User, match: (p) => p.startsWith('/mypage') || p.startsWith('/login') }

  const renderTab = ({ to, label, Icon, match }) => (
    <Link key={label} to={to} className={`mobile-tab ${match(location.pathname) ? 'mobile-tab-active' : ''}`}>
      <Icon size={20} />
      <span>{label}</span>
    </Link>
  )

  return (
    <nav className="mobile-tab-bar">
      {LEFT_TABS.map(renderTab)}
      <Link to={user ? '/garden' : '/login'} className="mobile-tab-fab" aria-label="식물 등록 및 관리">
        <Plus size={22} />
      </Link>
      {RIGHT_TABS.map(renderTab)}
      {renderTab(myTab)}
    </nav>
  )
}
