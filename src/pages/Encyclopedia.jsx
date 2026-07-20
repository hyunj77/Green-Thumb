import { useState } from 'react'
import { PawPrint, Search, Sun, Droplet } from 'lucide-react'
import { PLANT_SPECIES, DIFFICULTY_ORDER } from '../lib/encyclopedia'

export default function Encyclopedia() {
  const [query, setQuery] = useState('')
  const [difficulty, setDifficulty] = useState('')
  const filtered = PLANT_SPECIES
    .filter((p) => p.name.includes(query.trim()))
    .filter((p) => !difficulty || p.difficulty === difficulty)

  return (
    <div style={{ padding: '0 20px 40px' }}>
      <h2>📖 식물 도감</h2>
      <p className="muted" style={{ marginBottom: 16 }}>기본 관리법을 참고해서 나에게 맞는 식물을 찾아보세요</p>

      <div style={{ position: 'relative', marginBottom: 14, maxWidth: 320 }}>
        <Search size={16} style={{ position: 'absolute', left: 14, top: 13, color: 'var(--accent)' }} />
        <input type="text" placeholder="식물 이름 검색" value={query} onChange={(e) => setQuery(e.target.value)} style={{ paddingLeft: 38 }} />
      </div>

      <div className="chip-row" style={{ marginTop: 0, marginBottom: 20 }}>
        <button className={`chip ${difficulty === '' ? 'chip-active' : ''}`} onClick={() => setDifficulty('')}>전체 난이도</button>
        {DIFFICULTY_ORDER.map((level) => (
          <button key={level} className={`chip ${difficulty === level ? 'chip-active' : ''}`} onClick={() => setDifficulty(level)}>
            {level}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
        {filtered.map((plant) => (
          <div key={plant.name} className="card" style={{ padding: 18 }}>
            <div style={{ fontSize: 34 }}>{plant.emoji}</div>
            <div style={{ fontWeight: 700, color: 'var(--text-h)', margin: '8px 0 4px' }}>{plant.name}</div>
            <span className="badge">난이도 {plant.difficulty}</span>
            <div className="muted" style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Droplet size={13} /> {plant.watering}
            </div>
            <div className="muted" style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Sun size={13} /> {plant.light}
            </div>
            <div className="muted" style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
              <PawPrint size={13} /> {plant.petSafe ? '반려동물 안전' : '반려동물 주의'}
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="muted">검색 결과가 없어요.</p>}
      </div>
    </div>
  )
}
