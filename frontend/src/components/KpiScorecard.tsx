import { AlertTriangle, Gauge, Target, TrendingUp } from 'lucide-react'
import type { Metrics } from '../types/dashboard'

const number = (value: number) =>
  new Intl.NumberFormat('en-GB', {
    maximumFractionDigits: 2,
  }).format(value)

export function KpiScorecard({ metrics }: { metrics: Metrics }) {
  const cards = [
    [
      'Mean absolute error',
      `${number(metrics.mae)} MW`,
      'Average miss per half-hour',
      Target,
    ],
    [
      'Forecast accuracy',
      `${number(metrics.accuracy_rate_percent)}%`,
      `MAPE ${number(metrics.mape)}%`,
      Gauge,
    ],
    [
      'RMSE & volatility',
      `${number(metrics.rmse)} MW`,
      `${number(metrics.rmse_mae_ratio)}× MAE · ${metrics.volatility_status}`,
      AlertTriangle,
    ],
    [
      'Directional bias',
      `${metrics.mbe > 0 ? '+' : ''}${number(metrics.mbe)} MW`,
      metrics.bias_direction,
      TrendingUp,
    ],
  ] as const

  return (
    <section className="kpi-grid">
      {cards.map(([title, value, detail, Icon]) => (
        <article className="kpi-card" key={title}>
          <div className="kpi-top">
            <span>{title}</span>
            <Icon size={17} />
          </div>

          <strong>{value}</strong>
          <p>{detail}</p>
        </article>
      ))}
    </section>
  )
}