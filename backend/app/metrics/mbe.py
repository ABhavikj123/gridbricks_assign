from collections.abc import Sequence


def calculate_mbe(rows: Sequence[dict]) -> dict:
    mbe = sum(row["signed_error_mw"] for row in rows) / len(rows) if rows else 0.0
    if mbe > 50:
        direction = "Consistent Over-Forecast (Grid Deficit Risk — Buy Extra Backup Power)"
    elif mbe < -50:
        direction = "Consistent Under-Forecast (Surplus Wind — Reduce Thermal Backup)"
    else:
        direction = "Near-Neutral Bias"
    return {"mbe": round(mbe, 2), "bias_direction": direction}
