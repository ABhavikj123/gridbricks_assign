import { create } from 'zustand'
import { fetchDashboard } from '../services/api'
import type { DashboardPayload, ViewMode } from '../types/dashboard'

interface DashboardState {
  payload: DashboardPayload | null
  loading: boolean
  error: string | null
  viewMode: ViewMode
  selectedWeek: string
  selectedDate: string
  load: () => Promise<void>
  setViewMode: (mode: ViewMode) => void
  setSelectedWeek: (week: string) => void
  setSelectedDate: (date: string) => void
}

export const useDashboardStore = create<DashboardState>((set) => ({
  payload: null, loading: true, error: null, viewMode: 'month',
  selectedWeek: 'Week 1 (Jan 1-7)', selectedDate: '2026-01-01',
  load: async () => {
    set({ loading: true, error: null })
    try { set({ payload: await fetchDashboard(), loading: false }) }
    catch (error) { set({ error: error instanceof Error ? error.message : 'Unable to load dashboard', loading: false }) }
  },
  setViewMode: (viewMode) => set({ viewMode }),
  setSelectedWeek: (selectedWeek) => set({ selectedWeek }),
  setSelectedDate: (selectedDate) => set({ selectedDate }),
}))
