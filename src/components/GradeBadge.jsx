import { getGrade } from '../lib/grade'

// 커뮤니티 게시글/댓글 작성자 옆에 붙는 작은 등급 배지.
// compact: 좁은 목록에서는 이모지만 표시해 닉네임이 잘리지 않도록 한다.
export default function GradeBadge({ score, compact = false }) {
  if (score == null) return null
  const grade = getGrade(score)
  const label = `${grade.name} (그린 포인트 ${score})`
  if (compact) {
    return <span className="grade-badge-emoji" title={label} aria-label={label}>{grade.emoji}</span>
  }
  return (
    <span className="grade-badge" title={label}>
      {grade.emoji} {grade.name}
    </span>
  )
}
