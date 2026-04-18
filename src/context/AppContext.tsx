import React, { createContext, useContext, useState, type ReactNode } from 'react'
import type { Application, Status, Review, PageId } from '../types'
import {
  INITIAL_APPLICATIONS,
  INITIAL_STATUSES,
  INITIAL_REVIEWS,
} from '../data/mockData'

interface AppContextType {
  applications: Application[]
  statuses: Status[]
  reviews: Review[]
  currentPage: PageId
  setCurrentPage: (page: PageId) => void
  addApplications: (apps: Application[]) => void
  archiveApplication: (id: string, review: Review) => void
  moveApplication: (id: string, newStatusId: string) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [applications, setApplications] = useState<Application[]>(INITIAL_APPLICATIONS)
  const [statuses] = useState<Status[]>(INITIAL_STATUSES)
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS)
  const [currentPage, setCurrentPage] = useState<PageId>('kanban')

  const addApplications = (newApps: Application[]) => {
    setApplications((prev) => [...prev, ...newApps])
  }

  const archiveApplication = (id: string, review: Review) => {
    setApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, isArchived: true } : app))
    )
    setReviews((prev) => [...prev, review])
  }

  const moveApplication = (id: string, newStatusId: string) => {
    setApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, statusId: newStatusId } : app))
    )
  }

  return (
    <AppContext.Provider
      value={{
        applications,
        statuses,
        reviews,
        currentPage,
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
