const STORAGE_KEY = 'gt-theme'

// 'light' | 'dark' | null(시스템 설정을 따름)
export function getStoredTheme() {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    return v === 'light' || v === 'dark' ? v : null
  } catch {
    return null
  }
}

export function setTheme(theme) {
  if (theme === 'light' || theme === 'dark') {
    document.documentElement.setAttribute('data-theme', theme)
    try { localStorage.setItem(STORAGE_KEY, theme) } catch { /* 저장 불가 환경은 무시 */ }
  } else {
    document.documentElement.removeAttribute('data-theme')
    try { localStorage.removeItem(STORAGE_KEY) } catch { /* 저장 불가 환경은 무시 */ }
  }
}
