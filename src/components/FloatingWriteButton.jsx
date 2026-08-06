import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'

// .gt-tab-bar와 같은 이유로 body에 직접 포탈로 그린다 — #root의 zoom(0.96) 안에서
// position:fixed에 %기반 right를 쓰면 넓은 화면일수록 오른쪽 정렬이 어긋난다.
export default function FloatingWriteButton() {
  return createPortal(
    <Link to="/write" className="fab-write">
      <Plus size={18} /> 글쓰기
    </Link>,
    document.body
  )
}
