import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'

// iOS HIG 스타일 뒤로가기 헤더. 탭 최상위 화면(홈/커뮤니티/그린이/Plant/MY)을 제외한
// 모든 화면 좌측 상단에 일관되게 배치한다.
export default function BackHeader({ title, onBack, right, fallback = '/' }) {
  const navigate = useNavigate()

  const handleBack = () => {
    if (onBack) return onBack()
    if (window.history.length > 1) navigate(-1)
    else navigate(fallback)
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '18px 0 12px' }}>
      <button className="gt-icon-btn" onClick={handleBack} aria-label="뒤로가기" style={{ flexShrink: 0 }}>
        <ChevronLeft size={22} />
      </button>
      {title && <h2 style={{ margin: 0, fontSize: 18, flex: 1, minWidth: 0 }}>{title}</h2>}
      {right}
    </div>
  )
}
