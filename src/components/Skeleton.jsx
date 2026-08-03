// 데이터가 도착하기 전 레이아웃이 훅 바뀌지 않도록 미리 자리를 잡아주는 스켈레톤.
export function SkeletonBlock({ width = '100%', height = 16, radius = 8, style }) {
  return <div className="skeleton-block" style={{ width, height, borderRadius: radius, ...style }} />
}

export function SkeletonCard() {
  return (
    <div className="card skeleton-card">
      <SkeletonBlock height={120} radius={12} style={{ marginBottom: 12 }} />
      <SkeletonBlock height={14} width="70%" style={{ marginBottom: 8 }} />
      <SkeletonBlock height={12} width="40%" />
    </div>
  )
}

export function SkeletonRow() {
  return (
    <div className="skeleton-row">
      <SkeletonBlock width={40} height={40} radius={999} style={{ flexShrink: 0 }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <SkeletonBlock height={13} width="50%" />
        <SkeletonBlock height={12} width="85%" />
      </div>
    </div>
  )
}

export function SkeletonList({ count = 3, variant = 'row' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {Array.from({ length: count }).map((_, i) => (
        variant === 'card' ? <SkeletonCard key={i} /> : <SkeletonRow key={i} />
      ))}
    </div>
  )
}
