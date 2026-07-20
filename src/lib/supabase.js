import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// '자동 로그인' 체크 여부에 따라 세션을 localStorage(브라우저 재시작 후에도 유지)
// 또는 sessionStorage(탭을 닫으면 로그아웃)에 저장한다.
const REMEMBER_KEY = 'gt_remember_me'

export function setRememberMe(remember) {
  localStorage.setItem(REMEMBER_KEY, remember ? 'true' : 'false')
}

function isRemembering() {
  return localStorage.getItem(REMEMBER_KEY) !== 'false'
}

const sessionAwareStorage = {
  getItem: (key) => (isRemembering() ? localStorage.getItem(key) : sessionStorage.getItem(key)),
  setItem: (key, value) => {
    if (isRemembering()) {
      localStorage.setItem(key, value)
    } else {
      sessionStorage.setItem(key, value)
    }
  },
  removeItem: (key) => {
    localStorage.removeItem(key)
    sessionStorage.removeItem(key)
  },
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { storage: sessionAwareStorage },
})
