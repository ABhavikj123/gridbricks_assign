# Wind Procurement Intelligence

A B2B dashboard for UK day-ahead electricity procurement teams. It aligns Elexon national wind actuals with the most recent forecast that was available before each delivery day, quantifies forecast risk, and pre-computes a bias-adjusted next-day wind recommendation and thermal reserve margin.

## Architecture

```text
Elexon FUELHH + WINDFOR
          │
 FastAPI: fetch, day-ahead cutoff, alignment, metrics, recommendations
          │ one cached /api/dashboard payload
          ▼
 React: instantaneous month / week / day analysis
```

The backend is deliberately the analytical authority. It fetches FUELHH wind actuals at 30-minute resolution and WINDFOR forecasts concurrently in five-day chunks. For each delivery period it excludes forecasts published after 23:59:59 UTC on the previous day, selects the newest valid publication, forward-fills hourly values into half-hourly blocks, and caches the complete January 2026 payload in memory. No dashboard metric is calculated in the browser.

## Repository layout

```text
backend/                 FastAPI application and API contract
  app/fetcher.py         Concurrent, retrying Elexon client
  app/processor.py       Normalisation, cutoff, alignment and payload construction
  app/metrics/           MAE, MAPE, RMSE, MBE and procurement calculations
  README.md              Exact dashboard response contract
frontend/                Vite/React application
  src/components/        Dashboard UI panels and charts
  src/store/             Zustand master-payload and filter state
  src/types/             TypeScript API contract
requirements/            Assignment source material
```

## Run locally

Backend (Python 3.12 recommended):

```bash
cd backend
cp .env.example .env
python -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Frontend (Node 22 recommended):

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Open `http://localhost:5173`. The backend warms its in-memory cache at startup; its first launch therefore waits for the upstream Elexon requests to complete.

## Docker

Build the API:

```bash
docker build -t wind-dashboard-api ./backend
docker run --rm -p 8000:8000 --env-file backend/.env wind-dashboard-api
```

Build the web application (set the public API URL at build time when deploying):

```bash
docker build --build-arg VITE_BACKEND_URL=http://localhost:8000 -t wind-dashboard-web ./frontend
docker run --rm -p 8080:80 wind-dashboard-web
```

## Environment

`backend/.env` uses only `PORT`, `FUELHH_API_URL`, `WINDFOR_API_URL`, and `FRONTEND_URL`. `frontend/.env` uses only `VITE_BACKEND_URL`. Examples are provided in both folders.

## Quality checks

```bash
python3 -m py_compile $(rg --files backend/app -g '*.py')
cd frontend && npm run build && npm run lint
```

## AI usage

AI-assisted development tools were used during implementation. All data processing rules, API boundaries, output schema, and application behaviour were reviewed and implemented in the codebase.
