import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .cache import CACHE
from .config import get_settings
from .fetcher import ElexonClient
from .processor import build_dashboard
from .schemas import DashboardPayload

CACHE_KEY = "dashboard_master_payload"
_build_lock = asyncio.Lock()


async def get_dashboard_payload() -> dict:
    cached = CACHE.get(CACHE_KEY)
    if cached is not None:
        return cached
    async with _build_lock:
        cached = CACHE.get(CACHE_KEY)
        if cached is not None:
            return cached
        client = ElexonClient(get_settings())
        actuals, forecasts = await asyncio.gather(client.fetch_fuelhh(), client.fetch_windfor())
        payload = build_dashboard(actuals, forecasts)
        DashboardPayload.model_validate(payload)
        CACHE.set(CACHE_KEY, payload)
        return payload


@asynccontextmanager
async def lifespan(_: FastAPI):
    await get_dashboard_payload()
    yield


settings = get_settings()
app = FastAPI(title="Wind Procurement Dashboard API", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_credentials=False,
    allow_methods=["GET"],
    allow_headers=["*"],
)


@app.get("/api/dashboard", response_model=DashboardPayload)
async def dashboard() -> dict:
    return await get_dashboard_payload()
