import type { DashboardPayload } from '../types/dashboard'

const baseUrl = import.meta.env.BACKEND_URL ?? 'http://localhost:8000'

export async function fetchDashboard(): Promise<DashboardPayload> {
  const response = await fetch(`${baseUrl}/api/dashboard`)
  if (!response.ok) throw new Error(`Dashboard request failed (${response.status})`)
  return response.json() as Promise<DashboardPayload>
}
