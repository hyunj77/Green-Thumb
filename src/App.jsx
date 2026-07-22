import { HashRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import MobileTabBar from './components/MobileTabBar'
import ProtectedRoute from './components/ProtectedRoute'
import Feed from './pages/Feed'
import Community from './pages/Community'
import Login from './pages/Login'
import Signup from './pages/Signup'
import PostDetail from './pages/PostDetail'
import PostForm from './pages/PostForm'
import MyGarden from './pages/MyGarden'
import Marketplace from './pages/Marketplace'
import MyPage from './pages/MyPage'
import Encyclopedia from './pages/Encyclopedia'
import Magazine from './pages/Magazine'
import UserProfile from './pages/UserProfile'
import ResetPassword from './pages/ResetPassword'
import GradeGuide from './pages/GradeGuide'
import Notifications from './pages/Notifications'
import Messages from './pages/Messages'
import GreenieHome from './pages/GreenieHome'
import GreenieVisit from './pages/GreenieVisit'

export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Feed />} />
          <Route path="/community" element={<Community />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route path="/write" element={<ProtectedRoute><PostForm mode="create" /></ProtectedRoute>} />
          <Route path="/posts/:id" element={<PostDetail />} />
          <Route path="/posts/:id/edit" element={<ProtectedRoute><PostForm mode="edit" /></ProtectedRoute>} />

          <Route path="/garden" element={<MyGarden />} />
          <Route path="/market" element={<Marketplace />} />
          <Route path="/encyclopedia" element={<Encyclopedia />} />
          <Route path="/magazine" element={<Magazine />} />
          <Route path="/users/:id" element={<UserProfile />} />
          <Route path="/grades" element={<GradeGuide />} />
          <Route path="/mypage" element={<ProtectedRoute><MyPage /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
          <Route path="/greenie" element={<ProtectedRoute><GreenieHome /></ProtectedRoute>} />
          <Route path="/greenie/:userId" element={<GreenieVisit />} />
        </Routes>
        <MobileTabBar />
      </HashRouter>
    </AuthProvider>
  )
}
