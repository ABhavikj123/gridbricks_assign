# API Contract

## Endpoint

`GET /api/dashboard`

No request parameters are accepted. The API fetches and computes the January 2026 dashboard dataset once during application startup, retains it in process memory, and returns that cached master payload on every request.

## Response schema

```ts
type Metrics = {
  mae: number; mape: number; rmse: number; mbe: number;
  accuracy_rate_percent: number; rmse_mae_ratio: number;
  volatility_status: string; bias_direction: string;
  max_abs_error_mw: number; worst_period_time: string;
};

type SettlementPeriod = {
  startTime: string; settlementPeriod: number; publishTime: string;
  actual_mw: number; forecast_mw: number; signed_error_mw: number;
  abs_error_mw: number; ape_percent: number;
};

type ProcurementPeriod = {
  startTime: string; settlementPeriod: number; raw_forecast_mw: number;
  suggested_wind_mw: number; conservative_guaranteed_wind_mw: number;
};

type NextDaySuggestion = {
  target_date: string; based_on_start_date: string; based_on_end_date: string;
  historical_window_days: number; historical_blocks_count: number;
  confidence_badge: string; applied_mbe_adjustment_mw: number;
  safety_reserve_mae_mw: number; avg_raw_forecast_mw: number;
  avg_suggested_wind_mw: number; total_daily_mwh_adjustment: number;
  timeseries: ProcurementPeriod[];
};

type DayData = {
  date: string; metrics: Metrics; timeseries: SettlementPeriod[];
  next_day_suggestion: NextDaySuggestion;
};

type SliceData = { metrics: Metrics; timeseries: SettlementPeriod[] };

type DashboardPayload = {
  full_month: SliceData & {
    daily_summary: Array<{
      date: string; metrics: Metrics;
      average_actual_mw: number; average_forecast_mw: number;
    }>;
  };
  weeks: Record<string, SliceData>;
  days: Record<string, DayData>;
};
```

All timestamps are canonical UTC ISO-8601 strings (`YYYY-MM-DDTHH:mm:ssZ`). All numeric metric outputs are rounded to two decimal places.
