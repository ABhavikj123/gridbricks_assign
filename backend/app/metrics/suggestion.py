from collections.abc import Sequence
from datetime import date, timedelta


def build_suggestion(selected_date: date, all_rows: Sequence[dict], next_day_rows: Sequence[dict]) -> dict:
    window_start = max(date(2026, 1, 1), selected_date - timedelta(days=6))
    history = [row for row in all_rows if window_start <= date.fromisoformat(row["startTime"][:10]) <= selected_date]
    historical_mbe = sum(row["signed_error_mw"] for row in history) / len(history)
    historical_mae = sum(row["abs_error_mw"] for row in history) / len(history)
    window_days = (selected_date - window_start).days + 1
    if window_days <= 2:
        badge = "Initial Baseline (1-2 Days History)"
    elif window_days <= 6:
        badge = "Growing Confidence (3-6 Days History)"
    else:
        badge = "Full 7-Day Rolling Window"
    periods = []
    for row in next_day_rows:
        suggested = max(0.0, row["forecast_mw"] - historical_mbe)
        periods.append({
            "startTime": row["startTime"],
            "settlementPeriod": row["settlementPeriod"],
            "raw_forecast_mw": row["forecast_mw"],
            "suggested_wind_mw": round(suggested, 2),
            "conservative_guaranteed_wind_mw": round(max(0.0, suggested - historical_mae), 2),
        })
    raw_average = sum(row["raw_forecast_mw"] for row in periods) / len(periods)
    suggested_average = sum(row["suggested_wind_mw"] for row in periods) / len(periods)
    return {
        "target_date": (selected_date + timedelta(days=1)).isoformat(),
        "based_on_start_date": window_start.isoformat(),
        "based_on_end_date": selected_date.isoformat(),
        "historical_window_days": window_days,
        "historical_blocks_count": len(history),
        "confidence_badge": badge,
        "applied_mbe_adjustment_mw": round(historical_mbe, 2),
        "safety_reserve_mae_mw": round(historical_mae, 2),
        "avg_raw_forecast_mw": round(raw_average, 2),
        "avg_suggested_wind_mw": round(suggested_average, 2),
        "total_daily_mwh_adjustment": round((suggested_average - raw_average) * 24, 2),
        "timeseries": periods,
    }
