import { ShieldCheck } from 'lucide-react'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { NextDaySuggestion as Suggestion } from '../types/dashboard'

const value = (amount: number) =>
  `${new Intl.NumberFormat('en-GB', {
    maximumFractionDigits: 0,
  }).format(amount)} MW`

export function NextDaySuggestion({
  suggestion,
}: {
  suggestion: Suggestion
}) {
  return (
    <section className="panel procurement">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">D+1 PROCUREMENT RECOMMENDATION</p>
          <h2>Delivery date {suggestion.target_date}</h2>
        </div>

        <span className="badge">
          <ShieldCheck size={15} />
          {suggestion.confidence_badge}
        </span>
      </div>

      <div className="procurement-grid">
        <div className="recommendation-grid">
          <div>
            <span>Historical window</span>
            <strong>
              {suggestion.historical_window_days} days /{' '}
              {suggestion.historical_blocks_count} blocks
            </strong>
          </div>

          <div>
            <span>Raw forecast average</span>
            <strong>{value(suggestion.avg_raw_forecast_mw)}</strong>
          </div>

          <div>
            <span>Bias correction applied</span>
            <strong>
              {suggestion.applied_mbe_adjustment_mw > 0 ? '−' : '+'}
              {value(Math.abs(suggestion.applied_mbe_adjustment_mw))}
            </strong>
          </div>

          <div>
            <span>Adjusted wind forecast</span>
            <strong>{value(suggestion.avg_suggested_wind_mw)}</strong>
          </div>

          <div>
            <span>Thermal reserve margin</span>
            <strong>{value(suggestion.safety_reserve_mae_mw)}</strong>
          </div>

          <div>
            <span>Daily energy adjustment</span>
            <strong>
              {suggestion.total_daily_mwh_adjustment > 0 ? '+' : ''}
              {new Intl.NumberFormat('en-GB').format(
                suggestion.total_daily_mwh_adjustment,
              )}{' '}
              MWh
            </strong>
          </div>
        </div>

        <div className="chart">
          <ResponsiveContainer>
            <LineChart
              data={suggestion.timeseries.map((row) => ({
                ...row,
                time: row.startTime.slice(11, 16),
              }))}
            >
              <CartesianGrid stroke="#292929" vertical={false} />

              <XAxis
                dataKey="time"
                minTickGap={30}
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

              <Line
                dataKey="raw_forecast_mw"
                name="Raw forecast"
                stroke="#969696"
                strokeDasharray="6 4"
                dot={false}
              />

              <Line
                dataKey="suggested_wind_mw"
                name="Bias adjusted"
                stroke="#f5f5f5"
                strokeWidth={2}
                dot={false}
              />

              <Line
                dataKey="conservative_guaranteed_wind_mw"
                name="Guaranteed floor"
                stroke="#555"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  )
}