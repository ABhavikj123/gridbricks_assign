import { Activity, Database, Wind } from 'lucide-react'
import type { ViewMode } from '../types/dashboard'

export function Header({
  mode,
  onMode,
}: {
  mode: ViewMode
  onMode: (mode: ViewMode) => void
}) {
  return (
    <header className="header">
      <div className="brand">
        <div className="brand-mark">
          <Wind size={21} />
        </div>

        <div>
          <p className="eyebrow">UK DAY-AHEAD DESK</p>
          <h1>Wind Procurement Intelligence</h1>
        </div>
      </div>

      <div className="header-actions">
        <span className="status">
          <Activity size={14} />
          Cached market dataset
        </span>

        <div className="mode-tabs">
          {(
            [
              ['month', 'Full month'],
              ['week', 'Weekly'],
              ['day', 'Daily inspector'],
            ] as [ViewMode, string][]
          ).map(([key, label]) => (
            <button
              key={key}
              className={mode === key ? 'active' : ''}
              onClick={() => onMode(key)}
            >
              {label}
            </button>
          ))}
        </div>

        <Database size={18} className="muted-icon" />
      </div>
    </header>
  )
}