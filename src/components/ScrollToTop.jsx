import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// 라우트(경로)가 바뀔 때마다 스크롤을 최상단으로 리셋한다.
// 해시(#new-plant 등)로 특정 위치로 스크롤하는 페이지 자체 로직과 충돌하지 않도록
// pathname이 실제로 바뀐 경우에만 동작한다.
export default function ScrollToTop() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    // 해시(#new-plant 등)로 특정 위치를 가리키는 이동은 각 페이지가 자체적으로
    // scrollIntoView 처리하므로 여기서 최상단으로 되돌리지 않는다.
    if (hash) return
    window.scrollTo(0, 0)
  }, [pathname, hash])

  return null
}
