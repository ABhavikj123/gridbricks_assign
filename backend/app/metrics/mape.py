from collections.abc import Sequence


def calculate_mape(rows: Sequence[dict]) -> dict:
    valid = [row for row in rows if row["actual_mw"] > 0]
    mape = sum(row["ape_percent"] for row in valid) / len(valid) if valid else 0.0
    mape = round(mape, 2)
    return {"mape": mape, "accuracy_rate_percent": round(max(0.0, 100.0 - mape), 2)}
