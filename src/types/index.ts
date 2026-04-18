export interface Application {
  id: string
  companyName: string
  jobTitle: string
  statusId: string
  deadline?: string // ISO datetime string
  isArchived: boolean
}

export interface Status {
  id: string
  name: string
  sortOrder: number
  color: string // tailwind bg color class, e.g. 'bg-blue-500'
}

export interface Review {
  id: string
  applicationId: string
  companyName: string
  jobTitle: string
  failStage: string
  reasonTags: string[]
  notes: string
  createdAt: string
}

export type PageId = 'overview' | 'kanban' | 'review'
