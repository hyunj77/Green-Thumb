import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Droplets, Sprout } from 'lucide-react'
import { nextWateringDate, nextFertilizingDate } from '../lib/plants'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

export default function WateringCalendar({ plants }) {
  const [cursor, setCursor] = useState(() => {
    const d = new Date()
    d.setDate(1)
    return d
  })
  const [selected, setSelected] = useState(() => new Date())

  const duePlants = useMemo(() => {
    return plants
      .map((p) => ({ plant: p, due: nextWateringDate(p) }))
      .filter((x) => x.due)
  }, [plants])

  const dueFertilizer = useMemo(() => {
    return plants
      .map((p) => ({ plant: p, due: nextFertilizingDate(p) }))
      .filter((x) => x.due)
  }, [plants])

  const cells = useMemo(() => {
    const year = cursor.getFullYear()
    const month = cursor.getMonth()
    const firstWeekday = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const list = []
    for (let i = 0; i < firstWeekday; i++) list.push(null)
    for (let d = 1; d <= daysInMonth; d++) list.push(new Date(year, month, d))
    return list
  }, [cursor])

  const today = new Date()
  const dueOnSelected = duePlants.filter((x) => sameDay(x.due, selected))
  const fertilizerOnSelected = dueFertilizer.filter((x) => sameDay(x.due, selected))

  return (
    <div className="card watering-calendar" style={{ padding: 20, marginTop: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <h3 style={{ margin: 0, fontSize: 16 }}>💧🌱 케어 캘린더</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            className="secondary"
            aria-label="이전 달"
            onClick={() => setCursor((c) => new Date(c.getFullYear(), c.getMonth() - 1, 1))}
            style={{ padding: 6 }}
          >
            <ChevronLeft size={14} />
          </button>
          <span style={{ fontSize: 13, fontWeight: 700, minWidth: 72, textAlign: 'center' }}>
            {cursor.getFullYear()}.{String(cursor.getMonth() + 1).padStart(2, '0')}
          </span>
          <button
            className="secondary"
            aria-label="다음 달"
            onClick={() => setCursor((c) => new Date(c.getFullYear(), c.getMonth() + 1, 1))}
            style={{ padding: 6 }}
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      <div className="watering-calendar-grid">
        {WEEKDAYS.map((w) => (
          <div key={w} className="watering-calendar-weekday">{w}</div>
        ))}
        {cells.map((date, i) => {
          if (!date) return <div key={`pad-${i}`} />
          const due = duePlants.filter((x) => sameDay(x.due, date))
          const fertDue = dueFertilizer.filter((x) => sameDay(x.due, date))
          const isToday = sameDay(date, today)
          const isSelected = sameDay(date, selected)
          return (
            <button
              key={date.toISOString()}
              className={`watering-calendar-cell ${isToday ? 'is-today' : ''} ${isSelected ? 'is-selected' : ''}`}
              onClick={() => setSelected(date)}
            >
              <span>{date.getDate()}</span>
              {(due.length > 0 || fertDue.length > 0) && (
                <span className="watering-calendar-dots">
                  {due.length > 0 && <span className="watering-calendar-dot" />}
                  {fertDue.length > 0 && <span className="watering-calendar-dot-fert" />}
                </span>
              )}
            </button>
          )
        })}
      </div>

      <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
        <div className="contact-row-label" style={{ marginBottom: 8 }}>
          {selected.getMonth() + 1}월 {selected.getDate()}일 케어 예정
        </div>
        {dueOnSelected.length === 0 && fertilizerOnSelected.length === 0 ? (
          <p className="muted" style={{ margin: 0 }}>이 날 예정된 케어가 없어요.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {dueOnSelected.map(({ plant }) => (
              <div key={`water-${plant.id}`} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5 }}>
                <Droplets size={14} color="#ff8a5c" />
                <span style={{ fontWeight: 700 }}>{plant.name}</span>
                <span className="muted">물주기 · {plant.watering_interval_days}일 주기</span>
              </div>
            ))}
            {fertilizerOnSelected.map(({ plant }) => (
              <div key={`fert-${plant.id}`} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5 }}>
                <Sprout size={14} color="var(--accent)" />
                <span style={{ fontWeight: 700 }}>{plant.name}</span>
                <span className="muted">영양제 · {plant.fertilizing_interval_days}일 주기</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
