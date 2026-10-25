import {
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { SettlementPeriod } from '../types/dashboard'

export function ErrorResidualChart({
  rows,
  mbe,
}: {
  rows: SettlementPeriod[]
  mbe: number
}) {
  const data = rows.map((r) => ({
    time: r.startTime.slice(11, 16),
    error: r.signed_error_mw,
  }))

  return (
    <section className="panel chart-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">FORECAST RESIDUALS</p>
          <h2>Signed error by settlement period</h2>
        </div>

        <span className="legend-note">
          <i /> Over forecast <i className="under" /> Under forecast
        </span>
      </div>

      <div className="chart">
        <ResponsiveContainer>
          <BarChart data={data}>
            <CartesianGrid stroke="#292929" vertical={false} />

            <XAxis
              dataKey="time"
              minTickGap={34}
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

            <ReferenceLine y={0} stroke="#aaa" />
            <ReferenceLine y={mbe} stroke="#777" strokeDasharray="4 4" />

            <Bar
              dataKey="error"
              fill="#b4b4b4"
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}