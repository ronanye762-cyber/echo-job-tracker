import { BookOpen, FileSearch, Calendar, Tag, FileText, TrendingDown } from 'lucide-react'
import { useApp } from '../context/AppContext'

const STAGE_COLORS: Record<string, { bg: string; text: string }> = {
  网申:        { bg: 'bg-blue-50',    text: 'text-blue-600' },
  笔试:        { bg: 'bg-violet-50',  text: 'text-violet-600' },
  一面:        { bg: 'bg-orange-50',  text: 'text-orange-600' },
  二面:        { bg: 'bg-amber-50',   text: 'text-amber-600' },
  Offer:      { bg: 'bg-emerald-50', text: 'text-emerald-600' },
  'Offer 谈薪':{ bg: 'bg-teal-50',   text: 'text-teal-600' },
}
const DEFAULT_STAGE_COLOR = { bg: 'bg-slate-100', text: 'text-slate-600' }

function formatDate(iso: string) {
  const d = new Date(iso)
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`
}

function CompanyAvatar({ name }: { name: string }) {
  const colors = [
    'from-blue-400 to-blue-600',
    'from-violet-400 to-violet-600',
    'from-orange-400 to-rose-500',
    'from-emerald-400 to-teal-600',
    'from-amber-400 to-orange-500',
  ]
  const idx = name.charCodeAt(0) % colors.length
  return (
    <div
      className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colors[idx]} flex items-center justify-center text-white font-bold text-base flex-shrink-0 shadow-sm`}
    >
      {name.slice(0, 1)}
    </div>
  )
}

export function ReviewPage() {
  const { reviews } = useApp()

  const sorted = [...reviews].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  // Stats
  const total = reviews.length
  const stageCounts = reviews.reduce<Record<string, number>>((acc, r) => {
    acc[r.failStage] = (acc[r.failStage] ?? 0) + 1
    return acc
  }, {})
  const topStage = Object.entries(stageCounts).sort((a, b) => b[1] - a[1])[0]
  const tagCounts = reviews.flatMap((r) => r.reasonTags).reduce<Record<string, number>>((acc, t) => {
    acc[t] = (acc[t] ?? 0) + 1
    return acc
  }, {})
  const topTag = Object.entries(tagCounts).sort((a, b) => b[1] - a[1])[0]

  return (
    <div className="p-8">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">复盘中心</h1>
        <p className="text-slate-500 mt-1 text-sm">沉淀每一次失败，为下一次面试积累弹药</p>
      </div>

      {/* Empty state */}
      {sorted.length === 0 && (
        <div className="flex flex-col items-center justify-center py-28 text-center">
          <div className="relative mb-6">
            <div className="w-20 h-20 bg-violet-50 rounded-3xl flex items-center justify-center">
              <BookOpen size={36} className="text-violet-300" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-xl flex items-center justify-center border-2 border-slate-100 shadow-sm">
              <FileSearch size={14} className="text-slate-400" />
            </div>
          </div>
          <h3 className="text-base font-bold text-slate-700 mb-2">复盘记录为空</h3>
          <p className="text-sm text-slate-400 max-w-xs leading-relaxed">
            在看板页将卡片拖入底部归档区，<br />
            填写复盘表单后记录将出现在此处
          </p>
        </div>
      )}

      {/* Has reviews */}
      {sorted.length > 0 && (
        <>
          {/* Summary stats */}
          <div className="grid grid-cols-3 gap-4 mb-7">
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <TrendingDown size={18} className="text-rose-500" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">累计复盘</p>
                <p className="text-2xl font-extrabold text-slate-800">{total}</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Calendar size={18} className="text-amber-500" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">最高发生轮次</p>
                <p className="text-lg font-bold text-slate-800">{topStage ? topStage[0] : '-'}</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Tag size={18} className="text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">最高频失败原因</p>
                <p className="text-lg font-bold text-slate-800">{topTag ? topTag[0] : '-'}</p>
              </div>
            </div>
          </div>

          {/* Review cards list */}
          <div className="space-y-4 max-w-3xl">
            {sorted.map((review) => {
              const stageColor = STAGE_COLORS[review.failStage] ?? DEFAULT_STAGE_COLOR
              return (
                <div
                  key={review.id}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                >
                  {/* Red top bar */}
                  <div className="h-1 bg-gradient-to-r from-rose-400 to-red-500" />

                  <div className="p-5">
                    {/* Header row */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <CompanyAvatar name={review.companyName} />
                        <div>
                          <p className="text-sm font-bold text-slate-800">{review.companyName}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{review.jobTitle}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${stageColor.bg} ${stageColor.text}`}
                        >
                          挂于 · {review.failStage}
                        </span>
                        <span className="text-xs text-slate-400">{formatDate(review.createdAt)}</span>
                      </div>
                    </div>

                    {/* Reason tags */}
                    {review.reasonTags.length > 0 && (
                      <div className="mb-3">
                        <div className="flex items-center gap-1.5 mb-2">
                          <Tag size={11} className="text-slate-400" />
                          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">失败归因</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {review.reasonTags.map((tag) => (
                            <span
                              key={tag}
                              className="text-xs px-2.5 py-1 bg-slate-50 text-slate-600 rounded-full border border-slate-200"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    {review.notes && (
                      <div className="bg-slate-50 rounded-xl p-3.5">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <FileText size={11} className="text-slate-400" />
                          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">反思笔记</span>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{review.notes}</p>
                      </div>
                    )}

                    {/* No tags and no notes fallback */}
                    {review.reasonTags.length === 0 && !review.notes && (
                      <p className="text-xs text-slate-400 italic">暂无详细复盘记录</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
