function bucketByWeek(posts, weeks = 6) {
  const now = new Date()
  const buckets = Array.from({ length: weeks }, (_, i) => {
    const weeksAgo = weeks - 1 - i
    const start = new Date(now)
    start.setDate(start.getDate() - weeksAgo * 7 - now.getDay())
    start.setHours(0, 0, 0, 0)
    const end = new Date(start)
    end.setDate(end.getDate() + 7)
    return { start, end, count: 0, label: `${start.getMonth() + 1}/${start.getDate()}` }
  })

  posts.forEach((post) => {
    const created = new Date(post.created_at)
    const bucket = buckets.find((b) => created >= b.start && created < b.end)
    if (bucket) bucket.count += 1
  })

  return buckets
}

export default function ActivityChart({ posts }) {
  const buckets = bucketByWeek(posts)
  const max = Math.max(1, ...buckets.map((b) => b.count))

  return (
    <div className="activity-chart">
      {buckets.map((b) => (
        <div key={b.label} className="activity-bar-col">
          <div className="activity-bar-track">
            <div className="activity-bar" style={{ height: `${(b.count / max) * 100}%` }} title={`${b.count}개`} />
          </div>
          <span className="muted" style={{ fontSize: 11 }}>{b.label}</span>
        </div>
      ))}
    </div>
  )
}
