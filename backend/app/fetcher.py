import asyncio
from datetime import date, datetime, timedelta, timezone
from typing import Any

import httpx

from .config import Settings

UTC = timezone.utc


class ElexonClient:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings

    async def _get(self, client: httpx.AsyncClient, url: str, params: dict[str, str]) -> list[dict[str, Any]]:
        last_error: Exception | None = None
        for attempt in range(3):
            try:
                response = await client.get(url, params=params)
                response.raise_for_status()
                body = response.json()
                if not isinstance(body, list):
                    raise ValueError("Elexon stream response must be a JSON array")
                return body
            except (httpx.HTTPError, ValueError) as error:
                last_error = error
                if attempt < 2:
                    await asyncio.sleep(0.5 * (2**attempt))
        raise RuntimeError(f"Elexon request failed after retries: {last_error}")

    async def fetch_fuelhh(self) -> list[dict[str, Any]]:
        params = {"settlementDateFrom": "2026-01-01", "settlementDateTo": "2026-01-31"}
        async with httpx.AsyncClient(timeout=httpx.Timeout(45.0), follow_redirects=True) as client:
            records = await self._get(client, self.settings.fuelhh_api_url, params)
        return [record for record in records if record.get("fuelType") == "WIND"]

    async def fetch_windfor(self) -> list[dict[str, Any]]:
        start = datetime(2025, 12, 28, tzinfo=UTC)
        end = datetime(2026, 1, 31, 23, 59, 59, tzinfo=UTC)
        chunks: list[tuple[datetime, datetime]] = []
        cursor = start
        while cursor <= end:
            chunk_end = min(cursor + timedelta(days=5) - timedelta(seconds=1), end)
            chunks.append((cursor, chunk_end))
            cursor = chunk_end + timedelta(seconds=1)
        async with httpx.AsyncClient(timeout=httpx.Timeout(60.0), follow_redirects=True) as client:
            batches = await asyncio.gather(*[
                self._get(client, self.settings.windfor_api_url, {
                    "publishDateTimeFrom": chunk_start.strftime("%Y-%m-%dT%H:%M:%SZ"),
                    "publishDateTimeTo": chunk_end.strftime("%Y-%m-%dT%H:%M:%SZ"),
                })
                for chunk_start, chunk_end in chunks
            ])
        return [record for batch in batches for record in batch]
