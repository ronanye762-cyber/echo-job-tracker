import {
  TrendingUp,
  FileText,
  Clock,
  XCircle,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react'
import { useApp } from '../context/AppContext'

const STATUS_BAR_COLORS: Record<string, string> = {
  s1: 'bg-blue-500',
  s2: 'bg-violet-500',
  s3: 'bg-orange-500',
  s4: 'bg-amber-500',
  s5: 'bg-emerald-500',
}

function formatDeadline(iso: string): { label: string; urgent: boolean } {
  const diff = new Date(iso).getTime() - Date.now()
  if (diff <= 0) return { label: '已截止', urgent: true }
  const hours = diff / (1000 * 60 * 60)
  if (hours < 24) return { label: `${Math.floor(hours)}h 后截止`, urgent: true }
  const days = Math.ceil(hours / 24)
  return { label: `${days}天后截止`, urgent: false }
}

export function OverviewPage() {
  const { applications, statuses } = useApp()

  const active = applications.filter((a) => !a.isArchived)
  const archived = applications.filter((a) => a.isArchived)

  const now = Date.now()
  const upcoming = active.filter((a) => {
    if (!a.deadline) return false
    const diff = new Date(a.deadline).getTime() - now
    return diff > 0 && diff < 7 * 24 * 60 * 60 * 1000
  })

  const statusCounts = statuses.map((s) => ({
    ...s,
    count: active.filter((a) => a.statusId === s.id).length,
  }))
  const maxCount = Math.max(...statusCounts.map((s) => s.count), 1)

  const stats = [
    {
      label: '总投递',
      value: applications.length,
      icon: FileText,
      bg: 'bg-blue-50',
      icon_color: 'text-blue-600',
      val_color: 'text-blue-700',
    },
    {
      label: '进行中',
      value: active.length,
      icon: TrendingUp,
      bg: 'bg-emerald-50',
      icon_color: 'text-emerald-600',
      val_color: 'text-emerald-700',
    },
    {
      label: '7天内截止',
      value: upcoming.length,
      icon: Clock,
      bg: 'bg-amber-50',
      icon_color: 'text-amber-600',
      val_color: 'text-amber-700',
    },
    {
      label: '已归档',
      value: archived.length,
      icon: XCircle,
      bg: 'bg-rose-50',
      icon_color: 'text-rose-500',
      val_color: 'text-rose-600',
    },
  ]

  return (
    <div className="p-8 max-w-6xl">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">全盘总览</h1>
        <p className="text-slate-500 mt-1 text-sm">一览你的求职全局，把握每一个机会</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-5 mb-7">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-slate-500">{s.label}</span>
              <div className={`w-9 h-9 ${s.bg} rounded-xl flex items-center justify-center`}>
                <s.icon size={17} className={s.icon_color} />
              </div>
            </div>
            <p className={`text-4xl font-extrabold ${s.val_color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-5 gap-5">
        {/* Status breakdown */}
        <div className="col-span-3 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-slate-800">各阶段分布</h2>
            <span className="text-xs text-slate-400">{active.length} 个进行中</span>
          </div>
          <div className="space-y-4">
            {statusCounts.map((s) => (
              <div key={s.id} className="flex items-center gap-3">
                <div className="w-10 text-xs text-slate-500 text-right font-medium shrink-0">
                  {s.name}
                </div>
                <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${STATUS_BAR_COLORS[s.id] ?? 'bg-slate-400'}`}
                    style={{ width: `${(s.count / maxCount) * 100}%` }}
                  />
                </div>
                <span className="w-5 text-xs font-semibold text-slate-600 text-right shrink-0">
                  {s.count}
                </span>
              </div>
            ))}
          </div>

          {/* Company tags */}
          {active.length > 0 && (
            <div className="mt-6 pt-5 border-t border-slate-100">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
                进行中的公司
              </p>
              <div className="flex flex-wrap gap-2">
                {active.map((app) => {
                  const status = statuses.find((s) => s.id === app.statusId)
                  return (
                    <span
                      key={app.id}
                      className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 bg-slate-50 text-slate-600 rounded-full border border-slate-200"
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${STATUS_BAR_COLORS[app.statusId] ?? 'bg-slate-400'}`}
                      />
                      {app.companyName}
                      <span className="text-slate-400">{status?.name}</span>
                    </span>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Upcoming deadlines */}
        <div className="col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-slate-800">即将截止</h2>
            <span className="text-xs text-slate-400">7天内</span>
          </div>

          {upcoming.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <CheckCircle2 size={32} className="text-emerald-400 mb-3" />
              <p className="text-sm font-medium text-slate-600">暂无紧迫截止</p>
              <p className="text-xs text-slate-400 mt-1">继续保持！</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcoming
                .sort(
                  (a, b) =>
                    new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime()
                )
                .map((app) => {
                  const { label, urgent } = formatDeadline(app.deadline!)
                  return (
                    <div
                      key={app.id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-default"
                    >
                      <div
                        className={`w-2 h-2 rounded-full shrink-0 ${urgent ? 'bg-red-500' : 'bg-amber-400'}`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-700 truncate">
                          {app.companyName}
                        </p>
                        <p className="text-xs text-slate-400 truncate">{app.jobTitle}</p>
                      </div>
                      <span
                        className={`text-xs font-semibold shrink-0 ${urgent ? 'text-red-500' : 'text-amber-500'}`}
                      >
                        {label}
                      </span>
                    </div>
                  )
                })}
            </div>
          )}

          {upcoming.length > 0 && (
            <button className="mt-4 w-full flex items-center justify-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium py-2 rounded-lg hover:bg-blue-50 transition-colors">
              前往看板处理
              <ArrowRight size={12} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
