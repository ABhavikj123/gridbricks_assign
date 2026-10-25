import { useState } from 'react'
import {
  Area,
  Brush,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { DailySummary, SettlementPeriod } from '../types/dashboard'

const compact = (v: string) => v.slice(5, 16).replace('T', ' ')

export function MainComparisonChart({
  rows,
  daily,
}: {
  rows: SettlementPeriod[]
  daily?: DailySummary[]
}) {
  const [resolution, setResolution] = useState<'daily' | 'half'>('daily')

  const chartData =
    resolution === 'daily' && daily
      ? daily.map((d) => ({
          time: d.date.slice(5),
          actual: d.average_actual_mw,
          forecast: d.average_forecast_mw,
        }))
      : rows.map((r) => ({
          time: compact(r.startTime),
          actual: r.actual_mw,
          forecast: r.forecast_mw,
        }))

  return (
    <section className="panel chart-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">GENERATION PROFILE</p>
          <h2>Actual versus day-ahead forecast</h2>
        </div>

        {daily && (
          <div className="segmented">
            <button
              className={resolution === 'daily' ? 'active' : ''}
              onClick={() => setResolution('daily')}
            >
              Daily average
            </button>

            <button
              className={resolution === 'half' ? 'active' : ''}
              onClick={() => setResolution('half')}
            >
              Half-hourly
            </button>
          </div>
        )}
      </div>

      <div className="chart tall">
        <ResponsiveContainer>
          <LineChart data={chartData}>
            <CartesianGrid stroke="#292929" vertical={false} />

            <XAxis
              dataKey="time"
              minTickGap={42}
              stroke="#777"
              tickLine={false}
              axisLine={false}
            />

            <YAxis
              stroke="#777"
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${Math.round(v / 1000)}k`}
            />

            <Tooltip
              contentStyle={{
                background: '#161616',
                border: '1px solid #3a3a3a',
                borderRadius: 8,
              }}
            />

            <Legend />

            <Area dataKey="actual" />

            <Line
              type="monotone"
              dataKey="actual"
              name="Actual wind"
              stroke="#fafafa"
              strokeWidth={2}
              dot={false}
            />

            <Line
              type="monotone"
              dataKey="forecast"
              name="Forecast wind"
              stroke="#8b8b8b"
              strokeWidth={2}
              strokeDasharray="7 5"
              dot={false}
            />

            {resolution === 'half' && (
              <Brush
                dataKey="time"
                height={24}
                stroke="#777"
                fill="#161616"
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}