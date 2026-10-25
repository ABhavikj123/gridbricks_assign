import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { DailySummary } from '../types/dashboard'

export function DailyHeatmapChart({
  daily,
  onSelect,
}: {
  daily: DailySummary[]
  onSelect: (date: string) => void
}) {
  return (
    <section className="panel chart-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">DAILY ACCURACY</p>
          <h2>MAE and bias across January</h2>
        </div>
        <span className="muted">Select a bar for daily inspection</span>
      </div>

      <div className="chart">
        <ResponsiveContainer>
          <BarChart
            data={daily}
            onClick={(state) => {
              const value = state?.activePayload?.[0]?.payload as
                | DailySummary
                | undefined

              if (value) onSelect(value.date)
            }}
          >
            <CartesianGrid stroke="#292929" vertical={false} />

            <XAxis
              dataKey="date"
              tickFormatter={(v) => v.slice(8)}
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

            <Bar
              dataKey="metrics.mae"
              name="MAE"
              fill="#e7e7e7"
              radius={[2, 2, 0, 0]}
            />

            <Bar
              dataKey="metrics.mbe"
              name="MBE"
              fill="#686868"
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}