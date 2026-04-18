import type { Application, Status, Review } from '../types'

export const INITIAL_STATUSES: Status[] = [
  { id: 's1', name: '网申', sortOrder: 1, color: 'bg-blue-500' },
  { id: 's2', name: '笔试', sortOrder: 2, color: 'bg-violet-500' },
  { id: 's3', name: '一面', sortOrder: 3, color: 'bg-orange-500' },
  { id: 's4', name: '二面', sortOrder: 4, color: 'bg-amber-500' },
  { id: 's5', name: 'Offer', sortOrder: 5, color: 'bg-emerald-500' },
]

// Helper: generate a deadline relative to now
function hoursFromNow(hours: number): string {
  const d = new Date()
  d.setHours(d.getHours() + hours)
  return d.toISOString()
}
function daysFromNow(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString()
}

export const INITIAL_APPLICATIONS: Application[] = [
  {
    id: 'app1',
    companyName: '美团',
    jobTitle: '产品经理（校招）',
    statusId: 's1',
    deadline: hoursFromNow(18), // < 24h → red countdown badge
    isArchived: false,
  },
  {
    id: 'app2',
    companyName: '字节跳动',
    jobTitle: '前端开发工程师',
    statusId: 's2',
    deadline: daysFromNow(2),
    isArchived: false,
  },
  {
    id: 'app3',
    companyName: '阿里巴巴',
    jobTitle: '数据分析师',
    statusId: 's3',
    isArchived: false,
  },
  {
    id: 'app4',
    companyName: '腾讯',
    jobTitle: '后端开发工程师',
    statusId: 's4',
    deadline: daysFromNow(7),
    isArchived: false,
  },
  {
    id: 'app5',
    companyName: '百度',
    jobTitle: '算法工程师（NLP）',
    statusId: 's1',
    deadline: daysFromNow(3),
    isArchived: false,
  },
  {
    id: 'app6',
    companyName: '京东',
    jobTitle: '产品运营实习',
    statusId: 's3',
    isArchived: false,
  },
]

export const INITIAL_REVIEWS: Review[] = []
