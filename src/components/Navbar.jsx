import { Link, useNavigate } from 'react-router-dom'
import { Bell, BookOpen, Leaf, Newspaper, Sprout, Store, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

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
        <Link to="/garden" className="chip"><Sprout size={14} /> 마이 그린 도감</Link>
        <Link to="/encyclopedia" className="chip"><BookOpen size={14} /> 식물 도감</Link>
        <Link to="/magazine" className="chip"><Newspaper size={14} /> 매거진</Link>
        <Link to="/market" className="chip"><Store size={14} /> 로컬 장터</Link>
        <button className="icon-btn" aria-label="알림">
          <Bell size={18} />
          <span className="icon-btn-dot" />
        </button>
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
