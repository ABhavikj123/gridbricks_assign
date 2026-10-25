from collections.abc import Sequence
from math import sqrt


def calculate_rmse(rows: Sequence[dict], mae: float) -> dict:
    if not rows:
        return {"rmse": 0.0, "rmse_mae_ratio": 1.0, "volatility_status": "Stable Error Distribution"}
    rmse = sqrt(sum(row["signed_error_mw"] ** 2 for row in rows) / len(rows))
    ratio = rmse / mae if mae > 0 else 1.0
    if ratio >= 1.30:
        status = "High Spike Risk (Severe Outlier Misses)"
    elif ratio >= 1.15:
        status = "Moderate Volatility"
    else:
        status = "Stable Error Distribution"
    return {"rmse": round(rmse, 2), "rmse_mae_ratio": round(ratio, 2), "volatility_status": status}
