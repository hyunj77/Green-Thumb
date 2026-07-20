import { Link, useNavigate } from 'react-router-dom'
import { Leaf, Sprout, Store, User } from 'lucide-react'
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
      <Link to="/" className="brand">
        <Leaf size={22} />
        Green Thumb
      </Link>
      <div className="nav-links">
        <Link to="/garden"><Sprout size={16} /> 마이 그린 도감</Link>
        <Link to="/market"><Store size={16} /> 로컬 장터</Link>
        {user ? (
          <>
            <Link to="/mypage"><User size={16} /> 마이페이지</Link>
            <button className="secondary" onClick={handleSignOut}>로그아웃</button>
          </>
        ) : (
          <Link to="/login"><button>로그인</button></Link>
        )}
      </div>
    </nav>
  )
}
