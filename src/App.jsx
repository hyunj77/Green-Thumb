import { HashRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import Feed from './pages/Feed'
import Login from './pages/Login'
import Signup from './pages/Signup'
import PostDetail from './pages/PostDetail'
import PostForm from './pages/PostForm'
import MyGarden from './pages/MyGarden'
import Marketplace from './pages/Marketplace'
import MyPage from './pages/MyPage'

export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Feed />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route path="/write" element={<ProtectedRoute><PostForm mode="create" /></ProtectedRoute>} />
          <Route path="/posts/:id" element={<PostDetail />} />
          <Route path="/posts/:id/edit" element={<ProtectedRoute><PostForm mode="edit" /></ProtectedRoute>} />

          <Route path="/garden" element={<MyGarden />} />
          <Route path="/market" element={<Marketplace />} />
          <Route path="/mypage" element={<ProtectedRoute><MyPage /></ProtectedRoute>} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  )
}
