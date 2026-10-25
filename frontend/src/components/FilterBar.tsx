import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import type { DashboardPayload, ViewMode } from '../types/dashboard'

const dates = Array.from(
  { length: 31 },
  (_, i) => `2026-01-${String(i + 1).padStart(2, '0')}`,
)

export function FilterBar({
  payload,
  mode,
  week,
  date,
  onWeek,
  onDate,
  onMode,
}: {
  payload: DashboardPayload
  mode: ViewMode
  week: string
  date: string
  onWeek: (value: string) => void
  onDate: (value: string) => void
  onMode: (mode: ViewMode) => void
}) {
  const index = dates.indexOf(date)

  if (mode === 'month') {
    return (
      <section className="filter-bar">
        <div>
          <p className="eyebrow">ANALYSIS WINDOW</p>
          <strong>January 2026 · 1,488 settlement periods</strong>
        </div>

        <span className="filter-note">
          Click a daily accuracy bar to investigate that delivery day.
        </span>
      </section>
    )
  }

  if (mode === 'week') {
    return (
      <section className="filter-bar">
        <div>
          <p className="eyebrow">ANALYSIS WINDOW</p>
          <strong>Weekly breakdown</strong>
        </div>

        <select
          value={week}
          onChange={(event) => onWeek(event.target.value)}
        >
          {Object.keys(payload.weeks).map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </section>
    )
  }

  return (
    <section className="filter-bar">
      <div>
        <p className="eyebrow">DELIVERY DATE</p>
        <strong>Daily settlement-period inspector</strong>
      </div>

      <div className="date-controls">
        <button
          disabled={index === 0}
          onClick={() => onDate(dates[index - 1])}
        >
          <ChevronLeft size={17} />
          Previous
        </button>

        <label className="date-picker">
          <CalendarDays size={16} />
          <input
            type="date"
            min="2026-01-01"
            max="2026-01-31"
            value={date}
            aria-label="Select delivery date"
            onChange={(event) => onDate(event.target.value)}
          />
        </label>

        <button
          disabled={index === dates.length - 1}
          onClick={() => onDate(dates[index + 1])}
        >
          Next
          <ChevronRight size={17} />
        </button>
      </div>

      <button className="quiet-button" onClick={() => onMode('month')}>
        Return to overview
      </button>
    </section>
  )
}