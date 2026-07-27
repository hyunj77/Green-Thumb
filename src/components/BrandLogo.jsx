import { Leaf } from 'lucide-react'

// 앱 전체에서 "Green Thumb" 로고를 완전히 동일한 위치·크기·색상·글꼴로 보여주기 위한
// 단일 컴포넌트. 상위 컨테이너의 font-family/line-height 등에 영향받지 않도록
// 필요한 스타일을 전부 인라인으로 명시한다.
export default function BrandLogo() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        fontFamily: "'Pretendard', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
        fontSize: 17,
        fontWeight: 800,
        lineHeight: 1,
        color: '#00966F',
      }}
    >
      <Leaf size={20} />
      Green Thumb
    </div>
  )
}
