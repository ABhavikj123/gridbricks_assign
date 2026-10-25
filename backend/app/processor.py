from collections import defaultdict
from datetime import date, datetime, time, timedelta, timezone
from typing import Any

from .metrics import calculate_mae, calculate_mape, calculate_mbe, calculate_rmse
from .metrics.suggestion import build_suggestion

UTC = timezone.utc
JANUARY_START = date(2026, 1, 1)
JANUARY_END = date(2026, 1, 31)


def parse_timestamp(value: str) -> datetime:
    return datetime.fromisoformat(value.replace("Z", "+00:00")).astimezone(UTC)


def timestamp_string(value: datetime) -> str:
    return value.astimezone(UTC).strftime("%Y-%m-%dT%H:%M:%SZ")


def _metrics(rows: list[dict[str, Any]]) -> dict[str, Any]:
    mae = calculate_mae(rows)
    return {**mae, **calculate_mape(rows), **calculate_rmse(rows, mae["mae"]), **calculate_mbe(rows)}


def _validate_daily_rows(rows: list[dict[str, Any]], target: date) -> None:
    if len(rows) != 48 or [row["settlementPeriod"] for row in rows] != list(range(1, 49)):
        raise ValueError(f"Expected 48 complete settlement periods for {target.isoformat()}")


def build_dashboard(fuel_records: list[dict[str, Any]], forecast_records: list[dict[str, Any]]) -> dict[str, Any]:
    actual_by_time: dict[datetime, dict[str, Any]] = {}
    for record in fuel_records:
        start = parse_timestamp(record["startTime"])
        if JANUARY_START <= start.date() <= JANUARY_END:
            actual_by_time[start] = record

    selected_hourly: dict[datetime, dict[str, Any]] = {}
    for record in forecast_records:
        start = parse_timestamp(record["startTime"])
        if not JANUARY_START <= start.date() <= JANUARY_END + timedelta(days=1):
            continue
        published = parse_timestamp(record["publishTime"])
        cutoff = datetime.combine(start.date() - timedelta(days=1), time(23, 59, 59), tzinfo=UTC)
        if published > cutoff:
            continue
        current = selected_hourly.get(start)
        if current is None or parse_timestamp(current["publishTime"]) < published:
            selected_hourly[start] = record

    half_hour_forecasts: dict[datetime, dict[str, Any]] = {}
    for start, record in selected_hourly.items():
        for offset in (timedelta(), timedelta(minutes=30)):
            half_hour_forecasts[start + offset] = record

    all_forecast_blocks: dict[date, list[dict[str, Any]]] = defaultdict(list)
    previous: dict[str, Any] | None = None
    cursor = datetime.combine(JANUARY_START, time.min, tzinfo=UTC)
    final = datetime.combine(JANUARY_END + timedelta(days=1), time(23, 30), tzinfo=UTC)
    while cursor <= final:
        forecast = half_hour_forecasts.get(cursor) or previous
        if forecast is None:
            raise ValueError(f"No valid day-ahead forecast available at {timestamp_string(cursor)}")
        previous = forecast
        period = cursor.hour * 2 + (2 if cursor.minute == 30 else 1)
        block = {
            "startTime": timestamp_string(cursor),
            "settlementPeriod": period,
            "publishTime": timestamp_string(parse_timestamp(forecast["publishTime"])),
            "forecast_mw": float(forecast["generation"]),
        }
        all_forecast_blocks[cursor.date()].append(block)
        cursor += timedelta(minutes=30)

    january_rows: list[dict[str, Any]] = []
    daily_rows: dict[str, list[dict[str, Any]]] = {}
    for offset in range(31):
        target = JANUARY_START + timedelta(days=offset)
        rows: list[dict[str, Any]] = []
        for forecast in all_forecast_blocks[target]:
            start = parse_timestamp(forecast["startTime"])
            actual = actual_by_time.get(start)
            if actual is None:
                raise ValueError(f"No actual wind generation available at {forecast['startTime']}")
            actual_mw = float(actual["generation"])
            signed = forecast["forecast_mw"] - actual_mw
            rows.append({
                **forecast,
                "actual_mw": actual_mw,
                "signed_error_mw": round(signed, 2),
                "abs_error_mw": round(abs(signed), 2),
                "ape_percent": round((abs(signed) / actual_mw * 100) if actual_mw > 0 else 0.0, 2),
            })
        _validate_daily_rows(rows, target)
        daily_rows[target.isoformat()] = rows
        january_rows.extend(rows)

    daily_summary = [
        {
            "date": target,
            "metrics": _metrics(rows),
            "average_actual_mw": round(sum(row["actual_mw"] for row in rows) / 48, 2),
            "average_forecast_mw": round(sum(row["forecast_mw"] for row in rows) / 48, 2),
        }
        for target, rows in daily_rows.items()
    ]
    weeks: dict[str, dict[str, Any]] = {}
    week_ranges = [(1, 7), (8, 14), (15, 21), (22, 28), (29, 31)]
    for index, (start_day, end_day) in enumerate(week_ranges, start=1):
        rows = [row for day in range(start_day, end_day + 1) for row in daily_rows[f"2026-01-{day:02d}"]]
        weeks[f"Week {index} (Jan {start_day}-{end_day})"] = {"metrics": _metrics(rows), "timeseries": rows}

    days: dict[str, dict[str, Any]] = {}
    for target, rows in daily_rows.items():
        selected_date = date.fromisoformat(target)
        next_rows = all_forecast_blocks[selected_date + timedelta(days=1)]
        _validate_daily_rows(next_rows, selected_date + timedelta(days=1))
        days[target] = {
            "date": target,
            "metrics": _metrics(rows),
            "timeseries": rows,
            "next_day_suggestion": build_suggestion(selected_date, january_rows, next_rows),
        }
    return {
        "full_month": {"metrics": _metrics(january_rows), "timeseries": january_rows, "daily_summary": daily_summary},
        "weeks": weeks,
        "days": days,
    }
