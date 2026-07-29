import { useState } from 'react'
import { Camera } from 'lucide-react'
import { uploadImage } from '../lib/storage'

// 게시글/식물/장터/성장일기 공용 사진 첨부 필드.
// 갤러리에서 실제 파일을 업로드하는 게 기본 경로고, URL 직접 입력도 계속 지원한다.
export default function ImageUploadField({ folder, userId, value, onChange, placeholder = '사진 URL (선택 사항)' }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || !userId) return
    setUploading(true)
    setError('')
    const { url, error: uploadError } = await uploadImage(folder, userId, file)
    setUploading(false)
    if (uploadError) {
      setError('업로드에 실패했어요. 잠시 후 다시 시도해주세요.')
      return
    }
    onChange(url)
  }

  return (
    <div>
      {value && (
        <img
          src={value}
          alt=""
          style={{ width: '100%', maxHeight: 160, objectFit: 'cover', borderRadius: 12, marginBottom: 8, display: 'block' }}
        />
      )}
      <label
        className="secondary"
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          cursor: uploading ? 'not-allowed' : 'pointer', opacity: uploading ? 0.6 : 1, marginBottom: 8,
        }}
      >
        <Camera size={15} /> {uploading ? '업로드 중...' : '갤러리에서 사진 선택'}
        <input type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} disabled={uploading} />
      </label>
      <input type="url" placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} />
      {error && <p className="error-text" style={{ fontSize: 12, marginTop: 4 }}>{error}</p>}
    </div>
  )
}
