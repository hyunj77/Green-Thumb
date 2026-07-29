import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Bell, MessageSquare, Plus } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { fetchUnreadCount } from '../lib/notifications'
import BrandLogo from './BrandLogo'

export default function Navbar() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    if (!user) {
      setUnread(0)
      return
    }
    fetchUnreadCount(user.id).then(({ count }) => setUnread(count))
  }, [user])

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" style={{ color: 'inherit' }}>
          <BrandLogo />
        </Link>
      </div>
      <div className="nav-links">
        {user && <Link to="/garden" className="chip nav-link-desktop-only"><Plus size={14} /> 식물 등록</Link>}
        <Link to={user ? '/messages' : '/login'} className="chip nav-link-desktop-only"><MessageSquare size={14} /> 채팅</Link>
        <Link to={user ? '/notifications' : '/login'} className="icon-btn" aria-label="알림">
          <Bell size={16} />
          {unread > 0 && <span className="icon-btn-dot" />}
        </Link>
        {user ? (
          <button className="secondary" style={{ padding: '6px 16px', fontSize: 13 }} onClick={handleSignOut}>로그아웃</button>
        ) : (
          <Link to="/login"><button style={{ padding: '6px 16px', fontSize: 13 }}>로그인</button></Link>
        )}
      </div>
    </nav>
  )
}
