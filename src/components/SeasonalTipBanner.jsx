import { useState } from 'react'
import { X } from 'lucide-react'
import { getCurrentSeasonTip } from '../lib/seasonalTips'

// 기온 API 없이 현재 월 기준으로 계절 케어 팁을 보여준다. 계절이 바뀔 때마다 다시 노출되고,
// 닫으면 그 계절 동안은 다시 보이지 않는다 (매일 뜨는 성가신 팝업 방지).
export default function SeasonalTipBanner() {
  const tip = getCurrentSeasonTip()
  const storageKey = `gt-season-tip-dismissed-${tip.key}-${new Date().getFullYear()}`
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(storageKey) === '1')

  if (dismissed) return null

  const handleDismiss = () => {
    localStorage.setItem(storageKey, '1')
    setDismissed(true)
  }

  return (
    <div className="card gt-season-tip">
      <button type="button" className="gt-season-tip-close" onClick={handleDismiss} aria-label="닫기">
        <X size={14} />
      </button>
      <div className="gt-season-tip-label">{tip.emoji} {tip.label} 케어 팁</div>
      <p className="gt-season-tip-text">{tip.tip}</p>
    </div>
  )
}
