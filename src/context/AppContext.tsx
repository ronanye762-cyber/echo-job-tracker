import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react'
import type { Application, Status, Review, PageId } from '../types'
import { INITIAL_STATUSES } from '../data/mockData'
import {
  fetchStatuses,
  fetchApplications,
  fetchReviews,
  insertApplications,
  updateApplicationStatus,
  dbArchiveApplication,
  insertReview,
} from '../lib/db'

interface AppContextType {
  applications: Application[]
  statuses: Status[]
  reviews: Review[]
  currentPage: PageId
  loading: boolean
  setCurrentPage: (page: PageId) => void
  addApplications: (apps: Application[]) => Promise<void>
  archiveApplication: (id: string, review: Review) => Promise<void>
  moveApplication: (id: string, newStatusId: string) => Promise<void>
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [applications, setApplications] = useState<Application[]>([])
  const [statuses, setStatuses]         = useState<Status[]>(INITIAL_STATUSES)
  const [reviews, setReviews]           = useState<Review[]>([])
  const [currentPage, setCurrentPage]   = useState<PageId>('kanban')
  const [loading, setLoading]           = useState(true)

  // ── Load data from Supabase on mount ────────────────────────────────────────
  useEffect(() => {
    async function load() {
      try {
        const [dbStatuses, dbApps, dbReviews] = await Promise.all([
          fetchStatuses(),
          fetchApplications(),
          fetchReviews(),
        ])
        if (dbStatuses.length > 0) setStatuses(dbStatuses)
        setApplications(dbApps)
        setReviews(dbReviews)
      } catch (err) {
        console.error('Failed to load from Supabase:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // ── Operations (optimistic update → DB sync) ─────────────────────────────────

  const addApplications = async (newApps: Application[]) => {
    setApplications((prev) => [...prev, ...newApps])
    try {
      await insertApplications(newApps)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      alert(`[写入失败 - insertApplications]\n${msg}`)
    }
  }

  const archiveApplication = async (id: string, review: Review) => {
    setApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, isArchived: true } : app))
    )
    setReviews((prev) => [review, ...prev])
    try {
      await Promise.all([dbArchiveApplication(id), insertReview(review)])
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      alert(`[写入失败 - archiveApplication]\n${msg}`)
    }
  }

  const moveApplication = async (id: string, newStatusId: string) => {
    setApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, statusId: newStatusId } : app))
    )
    try {
      await updateApplicationStatus(id, newStatusId)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      alert(`[写入失败 - moveApplication]\n${msg}`)
    }
  }

  return (
    <AppContext.Provider
      value={{
        applications,
        statuses,
        reviews,
        currentPage,
        loading,
        setCurrentPage,
        addApplications,
        archiveApplication,
        moveApplication,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
