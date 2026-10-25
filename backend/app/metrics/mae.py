from collections.abc import Sequence


def calculate_mae(rows: Sequence[dict]) -> dict:
    if not rows:
        return {"mae": 0.0, "max_abs_error_mw": 0.0, "worst_period_time": ""}
    worst = max(rows, key=lambda row: row["abs_error_mw"])
    return {
        "mae": round(sum(row["abs_error_mw"] for row in rows) / len(rows), 2),
        "max_abs_error_mw": round(worst["abs_error_mw"], 2),
        "worst_period_time": worst["startTime"],
    }
