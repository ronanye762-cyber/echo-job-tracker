import { useDroppable } from '@dnd-kit/core'
import { Plus } from 'lucide-react'
import { clsx } from 'clsx'
import { KanbanCard } from './KanbanCard'
import type { Application, Status } from '../../types'

const STATUS_HEX: Record<string, string> = {
  s1: '#3b82f6',
  s2: '#8b5cf6',
  s3: '#f97316',
  s4: '#f59e0b',
  s5: '#10b981',
}

const STATUS_LIGHT_BG: Record<string, string> = {
  s1: 'rgba(59,130,246,0.06)',
  s2: 'rgba(139,92,246,0.06)',
  s3: 'rgba(249,115,22,0.06)',
  s4: 'rgba(245,158,11,0.06)',
  s5: 'rgba(16,185,129,0.06)',
}

interface KanbanColumnProps {
  status: Status
  apps: Application[]
  activeId: string | null
}

export function KanbanColumn({ status, apps, activeId }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status.id })

  const accentColor = STATUS_HEX[status.id] ?? '#94a3b8'
  const lightBg = STATUS_LIGHT_BG[status.id] ?? 'rgba(148,163,184,0.06)'

  // Count excluding the currently dragged card (so count shows where it came from)
  const displayCount = apps.filter((a) => a.id !== activeId).length + (activeId && apps.some(a => a.id === activeId) ? 1 : 0)

  return (
    <div className="flex-shrink-0 w-72 flex flex-col max-h-full">
      {/* Column header */}
      <div
        className="flex items-center justify-between px-3.5 py-3 rounded-t-2xl border border-b-0 border-slate-200"
        style={{ backgroundColor: lightBg }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: accentColor }}
          />
          <span className="text-sm font-bold text-slate-700">{status.name}</span>
          <span className="text-xs text-slate-400 bg-white rounded-full px-2 py-0.5 border border-slate-200 font-medium min-w-[24px] text-center">
            {apps.length}
          </span>
        </div>
        <button className="w-6 h-6 flex items-center justify-center rounded-md text-slate-400 hover:bg-white hover:text-slate-600 transition-colors">
          <Plus size={14} />
        </button>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        style={{
          borderColor: isOver ? accentColor : undefined,
          backgroundColor: isOver ? lightBg : '#f8fafc',
        }}
        className={clsx(
          'flex-1 min-h-48 p-2.5 space-y-2.5 rounded-b-2xl border border-slate-200 overflow-y-auto transition-colors duration-150',
          isOver ? 'border-2' : 'border',
        )}
      >
        {apps.length === 0 && !isOver && (
          <div className="flex flex-col items-center justify-center h-32 text-center">
            <div className="w-8 h-8 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center mb-2">
              <Plus size={14} className="text-slate-300" />
            </div>
            <p className="text-xs text-slate-400">拖拽卡片至此处</p>
          </div>
        )}

        {apps.map((app) => (
          <KanbanCard key={app.id} app={app} />
        ))}

        {/* Drop indicator when hovering over empty space */}
        {isOver && apps.length === 0 && (
          <div
            className="h-16 rounded-xl border-2 border-dashed"
            style={{ borderColor: accentColor, backgroundColor: lightBg }}
          />
        )}
      </div>
    </div>
  )
}
