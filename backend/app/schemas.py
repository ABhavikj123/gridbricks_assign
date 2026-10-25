from pydantic import BaseModel, ConfigDict, Field


class StrictModel(BaseModel):
    model_config = ConfigDict(extra="forbid")


class SettlementPeriod(StrictModel):
    startTime: str
    settlementPeriod: int = Field(ge=1, le=48)
    publishTime: str
    actual_mw: float
    forecast_mw: float
    signed_error_mw: float
    abs_error_mw: float
    ape_percent: float


class Metrics(StrictModel):
    mae: float
    mape: float
    rmse: float
    mbe: float
    accuracy_rate_percent: float
    rmse_mae_ratio: float
    volatility_status: str
    bias_direction: str
    max_abs_error_mw: float
    worst_period_time: str


class DailySummary(StrictModel):
    date: str
    metrics: Metrics
    average_actual_mw: float
    average_forecast_mw: float


class ProcurementPeriod(StrictModel):
    startTime: str
    settlementPeriod: int = Field(ge=1, le=48)
    raw_forecast_mw: float
    suggested_wind_mw: float
    conservative_guaranteed_wind_mw: float


class NextDaySuggestion(StrictModel):
    target_date: str
    based_on_start_date: str
    based_on_end_date: str
    historical_window_days: int
    historical_blocks_count: int
    confidence_badge: str
    applied_mbe_adjustment_mw: float
    safety_reserve_mae_mw: float
    avg_raw_forecast_mw: float
    avg_suggested_wind_mw: float
    total_daily_mwh_adjustment: float
    timeseries: list[ProcurementPeriod]


class DayData(StrictModel):
    date: str
    metrics: Metrics
    timeseries: list[SettlementPeriod]
    next_day_suggestion: NextDaySuggestion


class SliceData(StrictModel):
    metrics: Metrics
    timeseries: list[SettlementPeriod]


class FullMonthData(SliceData):
    daily_summary: list[DailySummary]


class DashboardPayload(StrictModel):
    full_month: FullMonthData
    weeks: dict[str, SliceData]
    days: dict[str, DayData]
