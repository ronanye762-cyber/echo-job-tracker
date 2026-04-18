import { useState } from 'react'
import { X, Tag, FileText, ChevronDown } from 'lucide-react'
import { clsx } from 'clsx'
import type { Application, Status } from '../../types'

const REASON_TAGS = [
  '简历挂',
  '算法未 A',
  'HR 筛选',
  '技术面挂',
  '薪资不符',
  '岗位撤销',
  '发挥失常',
  '竞争激烈',
  '流程超时',
  '背景不匹配',
]

interface ReviewModalProps {
  app: Application
  statuses: Status[]
  onSubmit: (failStage: string, reasonTags: string[], notes: string) => void
  onCancel: () => void
}

export function ReviewModal({ app, statuses, onSubmit, onCancel }: ReviewModalProps) {
  const currentStatusName = statuses.find((s) => s.id === app.statusId)?.name ?? '未知阶段'

  const [failStage, setFailStage] = useState(currentStatusName)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [notes, setNotes] = useState('')

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  const handleSubmit = () => {
    onSubmit(failStage, selectedTags, notes)
  }

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.55)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel()
      }}
    >
      {/* Modal card */}
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-in">
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-base">📝</span>
              <h2 className="text-base font-bold text-slate-800">面试复盘</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-700">{app.companyName}</span>
              <span className="text-slate-300">·</span>
              <span className="text-sm text-slate-500">{app.jobTitle}</span>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Section 1: Fail stage */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              <ChevronDown size={12} />
              挂在哪一轮
            </label>
            <div className="relative">
              <select
                value={failStage}
                onChange={(e) => setFailStage(e.target.value)}
                className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl px-3.5 py-2.5 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
              >
                {statuses.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name}
                  </option>
                ))}
                <option value="Offer 谈薪">Offer 谈薪</option>
              </select>
              <ChevronDown
                size={14}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>
          </div>

          {/* Section 2: Reason tags */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              <Tag size={12} />
              失败归因
              {selectedTags.length > 0 && (
                <span className="ml-1 text-blue-600 normal-case font-medium">
                  （已选 {selectedTags.length} 项）
                </span>
              )}
            </label>
            <div className="flex flex-wrap gap-2">
              {REASON_TAGS.map((tag) => {
                const active = selectedTags.includes(tag)
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={clsx(
                      'px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150',
                      active
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-200'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600',
                    )}
                  >
                    {tag}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Section 3: Notes */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              <FileText size={12} />
              反思笔记
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="记录这次面试中暴露的问题，以及下次如何改进……"
              rows={4}
              className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl px-3.5 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-300 leading-relaxed"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-6 pb-6">
          <p className="text-xs text-slate-400">提交后卡片将从看板移入复盘中心</p>
          <div className="flex gap-2">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSubmit}
              className="px-5 py-2 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 active:bg-red-700 rounded-xl transition-colors shadow-sm shadow-red-200"
            >
              确认归档
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
