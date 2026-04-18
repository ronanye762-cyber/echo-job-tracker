import { useDroppable } from '@dnd-kit/core'
import { Trash2 } from 'lucide-react'
import { clsx } from 'clsx'

export const FAILURE_ZONE_ID = '__failure_zone__'

export function FailureZone({ isDragActive }: { isDragActive: boolean }) {
  const { setNodeRef, isOver } = useDroppable({ id: FAILURE_ZONE_ID })

  return (
    <div
      ref={setNodeRef}
      className={clsx(
        'flex-shrink-0 mt-4 mb-6 rounded-2xl border-2 border-dashed',
        'flex items-center justify-center gap-3',
        'transition-all duration-200 select-none',
        isOver
          ? 'h-20 border-red-400 bg-red-50 scale-[1.01]'
          : isDragActive
          ? 'h-16 border-red-300 bg-red-50/60'
          : 'h-12 border-slate-200 bg-slate-50/40',
      )}
    >
      <Trash2
        size={isOver ? 20 : 15}
        className={clsx(
          'transition-all duration-200',
          isOver ? 'text-red-500' : isDragActive ? 'text-red-300' : 'text-slate-300',
        )}
      />
      <span
        className={clsx(
          'font-medium transition-all duration-200',
          isOver ? 'text-base text-red-600' : isDragActive ? 'text-sm text-red-400' : 'text-xs text-slate-300',
        )}
      >
        {isOver ? '松手以标记失败并开始复盘' : '🗑️ 拖入此处标记失败并复盘'}
      </span>
    </div>
  )
}
