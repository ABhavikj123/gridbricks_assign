import { useEffect } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { Header } from './components/Header'
import { FilterBar } from './components/FilterBar'
import { KpiScorecard } from './components/KpiScorecard'
import { MainComparisonChart } from './components/MainComparisonChart'
import { ErrorResidualChart } from './components/ErrorResidualChart'
import { DailyHeatmapChart } from './components/DailyHeatmapChart'
import { NextDaySuggestion } from './components/NextDaySuggestion'
import { DataTable } from './components/DataTable'
import { useDashboardStore } from './store/useDashboardStore'

function App() {
  const state = useDashboardStore()
  const load = useDashboardStore((store) => store.load)

  useEffect(() => {
    void load()
  }, [load])

  if (state.loading) {
    return (
      <main className="skeleton-page">
        <div className="skeleton-title" />
        <div className="skeleton-controls" />

        <div className="skeleton-kpis">
          {Array.from({ length: 4 }, (_, index) => (
            <div className="skeleton-card" key={index} />
          ))}
        </div>

        <div className="skeleton-chart" />
        <p>Loading cached market analysis</p>
      </main>
    )
  }

  if (state.error || !state.payload) {
    return (
      <main className="error-page">
        <AlertCircle size={32} />
        <h1>Dashboard unavailable</h1>
        <p>{state.error ?? 'No dashboard payload was received.'}</p>

        <button onClick={() => void state.load()}>
          <RefreshCw size={16} />
          Retry request
        </button>
      </main>
    )
  }

  const { payload } = state

  const slice =
    state.viewMode === 'month'
      ? payload.full_month
      : state.viewMode === 'week'
        ? payload.weeks[state.selectedWeek]
        : payload.days[state.selectedDate]

  const suggestion =
    state.viewMode === 'month'
      ? payload.days['2026-01-31'].next_day_suggestion
      : state.viewMode === 'week'
        ? payload.days[
            slice.timeseries.at(-1)?.startTime.slice(0, 10) ??
              '2026-01-31'
          ].next_day_suggestion
        : payload.days[state.selectedDate].next_day_suggestion

  const tableRows =
    state.viewMode === 'month'
      ? slice.timeseries.filter((row) => row.settlementPeriod === 48)
      : slice.timeseries

  return (
    <main className="app-shell">
      <Header mode={state.viewMode} onMode={state.setViewMode} />

      <FilterBar
        payload={payload}
        mode={state.viewMode}
        week={state.selectedWeek}
        date={state.selectedDate}
        onWeek={state.setSelectedWeek}
        onDate={state.setSelectedDate}
        onMode={state.setViewMode}
      />

      <KpiScorecard metrics={slice.metrics} />

      <MainComparisonChart
        rows={slice.timeseries}
        daily={
          state.viewMode === 'month'
            ? payload.full_month.daily_summary
            : undefined
        }
      />

      <div className="two-column">
        <ErrorResidualChart
          rows={slice.timeseries}
          mbe={slice.metrics.mbe}
        />

        {state.viewMode === 'month' ? (
          <DailyHeatmapChart
            daily={payload.full_month.daily_summary}
            onSelect={(date) => {
              state.setSelectedDate(date)
              state.setViewMode('day')
            }}
          />
        ) : (
          <section className="panel peak-card">
            <p className="eyebrow">PEAK MISS SUMMARY</p>
            <h2>Largest observed miss</h2>

            <strong>
              {new Intl.NumberFormat('en-GB', {
                maximumFractionDigits: 1,
              }).format(slice.metrics.max_abs_error_mw)}{' '}
              MW
            </strong>

            <p>
              {slice.metrics.worst_period_time
                .replace('T', ' ')
                .replace('Z', ' UTC')}
            </p>

            <hr />

            <span>{slice.metrics.volatility_status}</span>
          </section>
        )}
      </div>

      <NextDaySuggestion suggestion={suggestion} />

      <DataTable rows={tableRows} isMonthly={state.viewMode === 'month'} />
    </main>
  )
}

export default App