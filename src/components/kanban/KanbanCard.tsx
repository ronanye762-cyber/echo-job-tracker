import React from 'react'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { Clock, Calendar, GripVertical } from 'lucide-react'
import { clsx } from 'clsx'
import type { Application } from '../../types'

// ── Progress track config ──────────────────────────────────────────────────────
// 7 universal nodes, independent of how many kanban columns exist
const STEPS = ['投递', '测评', '筛选', '一面', '二面', 'Offer', '入职'] as const

// Map each statusId → which step index is the "current" active node
const STATUS_TO_STEP: Record<string, number> = {
  s1: 0, // 网申   → 投递
  s2: 1, // 笔试   → 测评
  s3: 3, // 一面   → 一面   (筛选 step 2 implicitly passed)
  s4: 4, // 二面   → 二面
  s5: 5, // Offer  → Offer
}

// Column accent color (only used for the tiny dot indicator, not a big bar)
const STATUS_COLOR: Record<string, string> = {
  s1: '#3b82f6',
  s2: '#8b5cf6',
  s3: '#f97316',
  s4: '#f59e0b',
  s5: '#10b981',
}

// ── Linear progress track ──────────────────────────────────────────────────────
function ProgressTrack({ statusId }: { statusId: string }) {
  const currentStep = STATUS_TO_STEP[statusId] ?? 0

  return (
    // pb-4 reserves room for the label that floats below the current dot
    <div className="pb-4">
      <div className="flex items-center w-full">
        {STEPS.map((label, i) => {
          const active  = i <= currentStep
          const current = i === currentStep

          return (
            <React.Fragment key={label}>
              {/* Dot + floating label */}
              <div className="relative flex-shrink-0 flex items-center justify-center">
                <div
                  className={clsx(
                    'rounded-full transition-all duration-200',
                    current
                      ? 'w-[11px] h-[11px] bg-blue-600 ring-2 ring-blue-100 ring-offset-1'
                      : active
                      ? 'w-2 h-2 bg-blue-600'
                      : 'w-2 h-2 bg-slate-200',
                  )}
                />
                {/* Label: only rendered for the current node; invisible span keeps layout stable for others */}
                <span
                  className={clsx(
                    'absolute top-[15px] left-1/2 -translate-x-1/2',
                    'text-[9px] font-semibold whitespace-nowrap leading-none',
                    current ? 'text-blue-600' : 'invisible select-none',
                  )}
                >
                  {label}
                </span>
              </div>

              {/* Connector line (flex-1 fills remaining space equally) */}
              {i < STEPS.length - 1 && (
                <div
                  className={clsx(
                    'flex-1 h-[1.5px] transition-colors duration-200',
                    i < currentStep ? 'bg-blue-600' : 'bg-slate-200',
                  )}
                />
              )}
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}

// ── DDL line (bottom, small, unobtrusive) ──────────────────────────────────────
function DeadlineLine({ deadline }: { deadline: string }) {
  const diff  = new Date(deadline).getTime() - Date.now()
  if (diff <= 0)
    return <span className="text-[10px] text-slate-400">已截止</span>

  const hours = diff / 3_600_000
  if (hours < 24)
    return (
      <span className="flex items-center gap-1 text-[10px] font-medium text-red-400">
        <Clock size={9} className="flex-shrink-0" />
        {Math.floor(hours)}h 后截止
      </span>
    )

  const days = Math.ceil(hours / 24)
  if (days <= 3)
    return (
      <span className="flex items-center gap-1 text-[10px] text-amber-500">
        <Clock size={9} className="flex-shrink-0" />
        {days} 天后截止
      </span>
    )

  const d = new Date(deadline)
  return (
    <span className="flex items-center gap-1 text-[10px] text-slate-400">
      <Calendar size={9} className="flex-shrink-0" />
      {d.getMonth() + 1}/{d.getDate()} 截止
    </span>
  )
}

// ── KanbanCard (ApplicationCard) ───────────────────────────────────────────────
interface KanbanCardProps {
  app: Application
  isOverlay?: boolean
}

export function KanbanCard({ app, isOverlay = false }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: app.id, data: { type: 'card', app } })

  const style = isOverlay
    ? { transform: 'rotate(1.5deg)', boxShadow: '0 16px 40px rgba(0,0,0,0.12)' }
    : { transform: CSS.Translate.toString(transform) }

  const accentColor = STATUS_COLOR[app.statusId] ?? '#94a3b8'

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={clsx(
        'bg-white rounded-xl border border-slate-100 shadow-sm',
        'cursor-grab active:cursor-grabbing transition-all duration-150',
        isDragging && !isOverlay ? 'opacity-25 scale-95' : '',
        isOverlay
          ? 'shadow-xl ring-1 ring-blue-200'
          : 'hover:shadow-md hover:border-slate-200',
      )}
    >
      {/* Ultra-thin 2 px accent bar — just a whisper of colour */}
      <div
        className="h-0.5 rounded-t-xl"
        style={{ backgroundColor: accentColor }}
      />

      <div className="px-3.5 pt-3 pb-3">
        {/* ── Company + grip ── */}
        <div className="flex items-start justify-between gap-1.5 mb-0.5">
          <p className="text-[13px] font-bold text-slate-800 leading-snug truncate">
            {app.companyName}
          </p>
          <GripVertical size={13} className="text-slate-250 flex-shrink-0 mt-0.5 text-slate-300" />
        </div>

        {/* ── Job title ── */}
        <p className="text-[11px] text-slate-400 leading-relaxed mb-3 truncate">
          {app.jobTitle}
        </p>

        {/* ── 7-node linear progress ── */}
        <ProgressTrack statusId={app.statusId} />

        {/* ── DDL — bottom, small text ── */}
        {app.deadline && (
          <div className="mt-0.5 pt-2 border-t border-slate-100">
            <DeadlineLine deadline={app.deadline} />
          </div>
        )}
      </div>
    </div>
  )
}
