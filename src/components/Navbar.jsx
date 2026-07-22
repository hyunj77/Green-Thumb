import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Bell, BookOpen, Leaf, MessageSquare, Newspaper, Sprout, Store, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { fetchUnreadCount } from '../lib/notifications'

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
        <Link to="/" className="brand">
          <Leaf size={22} />
          Green Thumb
        </Link>
      </div>
      <div className="nav-links">
        <Link to="/community" className="chip nav-link-secondary"><MessageSquare size={14} /> 커뮤니티</Link>
        <Link to="/garden" className="chip nav-link-secondary"><Sprout size={14} /> 마이 그린 도감</Link>
        <Link to="/encyclopedia" className="chip nav-link-secondary"><BookOpen size={14} /> 식물 도감</Link>
        <Link to="/magazine" className="chip nav-link-secondary"><Newspaper size={14} /> 매거진</Link>
        <Link to="/market" className="chip nav-link-secondary"><Store size={14} /> 로컬 장터</Link>
        <Link to={user ? '/notifications' : '/login'} className="icon-btn" aria-label="알림">
          <Bell size={18} />
          {unread > 0 && <span className="icon-btn-dot" />}
        </Link>
        {user ? (
          <>
            <Link to="/mypage" className="chip nav-link-secondary"><User size={14} /> 마이페이지</Link>
            <button className="secondary nav-link-secondary" onClick={handleSignOut}>로그아웃</button>
          </>
        ) : (
          <Link to="/login" className="nav-link-secondary"><button>로그인</button></Link>
        )}
      </div>
    </nav>
  )
}
