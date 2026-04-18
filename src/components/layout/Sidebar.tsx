import { BarChart3, Kanban, BookOpen, Briefcase } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import type { PageId } from '../../types'
import { clsx } from 'clsx'

const NAV_ITEMS = [
  { id: 'overview' as PageId, label: '全盘总览', sub: 'Dashboard', icon: BarChart3 },
  { id: 'kanban' as PageId, label: '求职看板', sub: 'Kanban', icon: Kanban },
  { id: 'review' as PageId, label: '复盘中心', sub: 'Review', icon: BookOpen },
]

export function Sidebar() {
  const { currentPage, setCurrentPage, applications } = useApp()

  const activeCount = applications.filter((a) => !a.isArchived).length

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col h-screen fixed left-0 top-0 z-20 select-none">
      {/* Brand */}
      <div className="h-16 flex items-center px-5 border-b border-slate-700/60 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/40">
            <Briefcase className="w-4.5 h-4.5 text-white" size={18} />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-bold text-white tracking-tight">求职看板</p>
            <p className="text-xs text-slate-400">Job Tracker Pro</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest px-3 mb-3">
          主菜单
        </p>
        {NAV_ITEMS.map(({ id, label, sub, icon: Icon }) => {
          const isActive = currentPage === id
          return (
            <button
              key={id}
              onClick={() => setCurrentPage(id)}
              className={clsx(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group',
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              )}
            >
              <Icon
                size={16}
                className={clsx(
                  'flex-shrink-0 transition-colors',
                  isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'
                )}
              />
              <span className="flex-1 text-left">{label}</span>
              {!isActive && (
                <span className="text-xs text-slate-600 group-hover:text-slate-500">{sub}</span>
              )}
            </button>
          )
        })}
      </nav>

      {/* Stats chip */}
      <div className="px-4 pb-2">
        <div className="rounded-xl bg-slate-800/80 border border-slate-700/50 p-4">
          <p className="text-xs text-slate-400 mb-2">当前投递进行中</p>
          <div className="flex items-end gap-1">
            <span className="text-3xl font-bold text-white">{activeCount}</span>
            <span className="text-slate-400 text-sm mb-0.5">个岗位</span>
          </div>
          <div className="mt-3 h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all"
              style={{ width: `${Math.min((activeCount / 10) * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* User */}
      <div className="p-4 border-t border-slate-700/60 flex-shrink-0">
        <div className="flex items-center gap-3 px-1">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-700 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
            张S
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-white truncate">张三同学</p>
            <p className="text-xs text-slate-500 truncate">25届秋招 · 产品/开发</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
