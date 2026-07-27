import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Bell, Leaf, MessageSquare, Plus, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { fetchUnreadCount } from '../lib/notifications'

export default function Navbar() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
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

  // 홈 화면은 자체 상단바(프로필/검색/알림)를 쓰므로, 모바일 폭에서 홈에 있을 때만
  // CSS로 이 네브바를 숨긴다(데스크톱은 계속 보임 — home-navbar-hide 클래스는 index.css 참고).
  return (
    <nav className={`navbar ${location.pathname === '/' ? 'navbar-home' : ''}`}>
      <div className="navbar-left">
        <Link to="/" className="brand">
          <Leaf size={22} />
          Green Thumb
        </Link>
      </div>
      <div className="nav-links">
        {user && <Link to="/garden" className="chip nav-link-desktop-only"><Plus size={14} /> 식물 등록</Link>}
        <Link to={user ? '/messages' : '/login'} className="chip nav-link-desktop-only"><MessageSquare size={14} /> 채팅</Link>
        <Link to={user ? '/notifications' : '/login'} className="icon-btn" aria-label="알림">
          <Bell size={18} />
          {unread > 0 && <span className="icon-btn-dot" />}
        </Link>
        {user ? (
          <>
            <Link to="/mypage" className="chip"><User size={14} /> 마이페이지</Link>
            <button className="secondary" onClick={handleSignOut}>로그아웃</button>
          </>
        ) : (
          <Link to="/login"><button>로그인</button></Link>
        )}
      </div>
    </nav>
  )
}
