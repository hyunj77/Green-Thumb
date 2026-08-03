import { getGrade } from '../lib/grade'

// 커뮤니티 게시글/댓글 작성자 옆에 붙는 작은 등급 배지.
export default function GradeBadge({ score }) {
  if (score == null) return null
  const grade = getGrade(score)
  return (
    <span className="grade-badge" title={`${grade.name} (그린 포인트 ${score})`}>
      {grade.emoji} {grade.name}
    </span>
  )
}
