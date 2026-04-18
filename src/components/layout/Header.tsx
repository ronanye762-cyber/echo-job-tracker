import { Upload, Bell, ChevronRight } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import type { PageId } from '../../types'

const PAGE_META: Record<PageId, { title: string; sub: string }> = {
  overview: { title: '全盘总览', sub: 'Dashboard' },
  kanban: { title: '求职看板', sub: 'Kanban Board' },
  review: { title: '复盘中心', sub: 'Review Center' },
}

interface HeaderProps {
  onBatchImport: () => void
}

export function Header({ onBatchImport }: HeaderProps) {
  const { currentPage, applications } = useApp()
  const meta = PAGE_META[currentPage]

  // urgent = deadline within 24h and not archived
  const urgentCount = applications.filter((a) => {
    if (a.isArchived || !a.deadline) return false
    const diff = new Date(a.deadline).getTime() - Date.now()
    return diff > 0 && diff < 24 * 60 * 60 * 1000
  }).length

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 fixed top-0 right-0 left-64 z-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-slate-400 font-medium">求职助手</span>
        <ChevronRight size={14} className="text-slate-300" />
        <span className="font-semibold text-slate-800">{meta.title}</span>
        <span className="hidden sm:inline text-slate-400 text-xs">/ {meta.sub}</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Bell */}
        <button className="relative w-9 h-9 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors">
          <Bell size={16} />
          {urgentCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
          )}
        </button>

        {/* Batch Import */}
        <button
          onClick={onBatchImport}
          className="flex items-center gap-2 pl-3 pr-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-medium rounded-lg transition-colors shadow-sm shadow-blue-600/25"
        >
          <Upload size={15} />
          <span>批量解析录入</span>
        </button>
      </div>
    </header>
  )
}
