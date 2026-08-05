import { useEffect } from 'react'

// 가로 스크롤 카드 행들(식물 카테고리 칩, 추천 이야기, 성장 타임랩스 등)은
// 스크롤바를 숨겨둔 채라 터치에서는 스와이프로 자연스럽게 넘어가지만,
// 마우스만 있는 데스크톱에서는 세로 휠을 굴려도 아무 반응이 없어서
// "스크롤이 안 된다"고 느껴진다. 세로 휠 입력을 해당 행의 가로 스크롤로
// 대신 흘려보내서 마우스로도 자연스럽게 넘길 수 있게 한다.
const SCROLL_ROW_SELECTOR = [
  '.tl-scrub-track',
  '.tl-records-strip',
  '.tl-thumb-scroll',
  '.story-scroll',
  '.plant-slider-track',
  '.view-toggle-row',
  '.notif-filter-row',
  '.user-search-row',
  '.community-tab-row',
  '.gt-post-scroll',
  '.gt-chip-row',
  '.gt-gardener-row',
].join(', ')

export default function HorizontalWheelScroll() {
  useEffect(() => {
    const handleWheel = (e) => {
      // 이미 가로 방향 제스처(트랙패드 좌우 스와이프 등)면 브라우저 기본 동작에 맡긴다
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return
      const row = e.target.closest(SCROLL_ROW_SELECTOR)
      if (!row || row.scrollWidth <= row.clientWidth) return
      e.preventDefault()
      row.scrollLeft += e.deltaY
    }
    document.addEventListener('wheel', handleWheel, { passive: false })
    return () => document.removeEventListener('wheel', handleWheel)
  }, [])

  return null
}
