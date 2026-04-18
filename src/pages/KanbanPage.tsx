import { useState } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { Kanban } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { KanbanColumn } from '../components/kanban/KanbanColumn'
import { KanbanCard } from '../components/kanban/KanbanCard'
import { FailureZone, FAILURE_ZONE_ID } from '../components/kanban/FailureZone'
import { ReviewModal } from '../components/kanban/ReviewModal'
import type { Application, Review } from '../types'

export function KanbanPage() {
  const { applications, statuses, moveApplication, archiveApplication } = useApp()
  const [activeId, setActiveId] = useState<string | null>(null)
  const [pendingApp, setPendingApp] = useState<Application | null>(null)

  // Require a 5px movement before drag initiates (prevents accidental drags on click)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const activeApp = activeId ? applications.find((a) => a.id === activeId) : null

  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveId(active.id as string)
  }

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveId(null)
    if (!over) return

    const appId = active.id as string
    const targetId = over.id as string

    // ── Drop on failure zone → open review modal ──────────────────
    if (targetId === FAILURE_ZONE_ID) {
      const app = applications.find((a) => a.id === appId)
      if (app) setPendingApp(app)
      return
    }

    // ── Drop on status column → move card ─────────────────────────
    const isValidColumn = statuses.some((s) => s.id === targetId)
    if (!isValidColumn) return

    const app = applications.find((a) => a.id === appId)
    if (!app || app.statusId === targetId) return

    moveApplication(appId, targetId)
  }

  const handleReviewSubmit = (
    failStage: string,
    reasonTags: string[],
    notes: string
  ) => {
    if (!pendingApp) return
    const review: Review = {
      id: crypto.randomUUID(),
      applicationId: pendingApp.id,
      companyName: pendingApp.companyName,
      jobTitle: pendingApp.jobTitle,
      failStage,
      reasonTags,
      notes,
      createdAt: new Date().toISOString(),
    }
    archiveApplication(pendingApp.id, review)
    setPendingApp(null)
  }

  const sorted = [...statuses].sort((a, b) => a.sortOrder - b.sortOrder)
  const active = applications.filter((a) => !a.isArchived)

  const urgentCount = active.filter((a) => {
    if (!a.deadline) return false
    return new Date(a.deadline).getTime() - Date.now() < 24 * 60 * 60 * 1000
  }).length

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Page header */}
      <div className="px-8 pt-8 pb-5 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <Kanban size={20} className="text-blue-600" />
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">求职看板</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              拖拽卡片跨列移动 · 拖入底部归档区标记失败
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-500">
            <span className="font-semibold text-slate-700">{active.length}</span> 个进行中
          </span>
          {urgentCount > 0 && (
            <span className="flex items-center gap-1.5 text-sm bg-red-50 px-3 py-1 rounded-full border border-red-100">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-red-600 font-semibold">{urgentCount}</span>
              <span className="text-red-400 text-xs">即将截止</span>
            </span>
          )}
        </div>
      </div>

      {/* DnD context wraps both columns and failure zone */}
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 min-h-0 flex flex-col px-8">
          {/* Columns — horizontal scroll */}
          <div className="flex gap-5 flex-1 min-h-0 overflow-x-auto overflow-y-hidden pb-2">
            {sorted.map((status) => (
              <KanbanColumn
                key={status.id}
                status={status}
                apps={active.filter((a) => a.statusId === status.id)}
                activeId={activeId}
              />
            ))}
          </div>

          {/* Failure zone — bottom strip */}
          <FailureZone isDragActive={activeId !== null} />
        </div>

        {/* Floating drag overlay */}
        <DragOverlay dropAnimation={null}>
          {activeApp && <KanbanCard app={activeApp} isOverlay />}
        </DragOverlay>
      </DndContext>

      {/* Review modal (outside DndContext so it layers above everything) */}
      {pendingApp && (
        <ReviewModal
          app={pendingApp}
          statuses={statuses}
          onSubmit={handleReviewSubmit}
          onCancel={() => setPendingApp(null)}
        />
      )}
    </div>
  )
}
