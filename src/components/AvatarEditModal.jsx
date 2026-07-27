import { useState } from 'react'
import { Camera } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { uploadAvatar } from '../lib/storage'

export default function AvatarEditModal({ userId, currentUrl, onClose, onSaved }) {
  const [urlInput, setUrlInput] = useState(currentUrl || '')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setUploading(true)
    setError('')
    const { url, error: uploadError } = await uploadAvatar(userId, file)
    setUploading(false)
    if (uploadError) {
      setError('업로드에 실패했어요. 잠시 후 다시 시도해주세요.')
      return
    }
    setUrlInput(url)
  }

  const handleSave = async () => {
    setSaving(true)
    const nextUrl = urlInput.trim() || null
    const { error: saveError } = await supabase.from('profiles').update({ avatar_url: nextUrl }).eq('id', userId)
    setSaving(false)
    if (!saveError) onSaved(nextUrl)
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, zIndex: 100 }}
      onClick={onClose}
    >
      <div className="card" style={{ width: '100%', maxWidth: 360, padding: 24 }} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ marginTop: 0 }}>프로필 사진 변경</h3>

        {urlInput && (
          <img
            src={urlInput}
            alt=""
            style={{ width: 88, height: 88, borderRadius: '50%', objectFit: 'cover', display: 'block', margin: '0 auto 16px' }}
          />
        )}

        <label className="secondary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: uploading ? 'not-allowed' : 'pointer', opacity: uploading ? 0.6 : 1 }}>
          <Camera size={15} /> {uploading ? '업로드 중...' : '갤러리에서 사진 선택'}
          <input type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} disabled={uploading} />
        </label>

        <p className="muted" style={{ fontSize: 12, textAlign: 'center', margin: '14px 0 8px' }}>또는 이미지 URL을 직접 입력할 수 있어요</p>
        <input type="url" placeholder="https://..." value={urlInput} onChange={(e) => setUrlInput(e.target.value)} />

        {error && <p className="error-text" style={{ fontSize: 12, marginTop: 8 }}>{error}</p>}

        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <button className="secondary" style={{ flex: 1 }} onClick={onClose}>취소</button>
          <button style={{ flex: 1 }} onClick={handleSave} disabled={saving || uploading}>
            {saving ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>
    </div>
  )
}
