import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { BookOpen, PawPrint, Search, Sun, Droplet } from 'lucide-react'
import BackHeader from '../components/BackHeader'
import { PLANT_SPECIES, DIFFICULTY_ORDER, PLANT_TYPES, matchesType } from '../lib/encyclopedia'
import { PLANT_DIRECTORY } from '../lib/plantDirectory'

// 상세 정보(물주기/난이도/반려동물 안전성)가 확인된 PLANT_SPECIES를 먼저,
// 이름·분류만 있는 PLANT_DIRECTORY를 뒤에 붙여서 도감 전체를 구성한다.
const ALL_PLANTS = [...PLANT_SPECIES, ...PLANT_DIRECTORY]

export default function Encyclopedia() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const [difficulty, setDifficulty] = useState('')
  const type = searchParams.get('type') || ''

  const setType = (next) => {
    if (next) setSearchParams({ type: next })
    else setSearchParams({})
  }

  const filtered = ALL_PLANTS
    .filter((p) => p.name.includes(query.trim()))
    .filter((p) => !difficulty || p.difficulty === difficulty)
    .filter((p) => matchesType(p, type))

  return (
    <div style={{ padding: '0 20px 40px' }}>
      <BackHeader title={<><BookOpen size={18} style={{ verticalAlign: -3, marginRight: 6 }} />식물 도감</>} />
      <p className="muted" style={{ marginBottom: 16 }}>{ALL_PLANTS.length}종의 식물을 만나보세요. 물주기·난이도 정보는 종류별로 순차 업데이트 중이에요</p>

      <div style={{ position: 'relative', marginBottom: 14, maxWidth: 320 }}>
        <Search size={16} style={{ position: 'absolute', left: 14, top: 11, color: 'var(--accent)' }} />
        <input type="text" className="search-input" placeholder="식물 이름 검색" value={query} onChange={(e) => setQuery(e.target.value)} style={{ paddingLeft: 38 }} />
      </div>

      <div className="filter-group-label">종류</div>
      <div className="chip-row" style={{ marginTop: 0, marginBottom: 16 }}>
        <button className={`chip ${type === '' ? 'chip-active' : ''}`} onClick={() => setType('')}>전체 종류</button>
        {PLANT_TYPES.map((t) => (
          <button key={t} className={`chip ${type === t ? 'chip-active' : ''}`} onClick={() => setType(t)}>{t}</button>
        ))}
      </div>

      <div className="filter-group-label">난이도</div>
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
          <div key={plant.name} className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {plant.photo ? (
              <img
                src={plant.photo}
                alt={plant.name}
                style={{ width: '100%', height: 130, objectFit: 'cover', display: 'block' }}
              />
            ) : (
              <div style={{ fontSize: 34, padding: '18px 18px 0' }}>{plant.emoji}</div>
            )}
            <div style={{ padding: 18 }}>
              <div style={{ fontWeight: 700, color: 'var(--text-h)', marginBottom: 4 }}>{plant.name}</div>
              {plant.difficulty ? (
                <>
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
                </>
              ) : (
                <span className="badge" style={{ background: 'var(--oat)', color: 'var(--text-soft)' }}>상세 정보 준비중</span>
              )}
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="muted">검색 결과가 없어요.</p>}
      </div>
    </div>
  )
}
