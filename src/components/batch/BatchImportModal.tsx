import { useState, useRef } from 'react'
import {
  X,
  Upload,
  FileImage,
  Sparkles,
  Check,
  Trash2,
  ChevronDown,
  AlertCircle,
  Database,
  Loader2,
} from 'lucide-react'
import { clsx } from 'clsx'
import { useApp } from '../../context/AppContext'
import type { Application } from '../../types'

// ── Types ──────────────────────────────────────────────────────────────────────
interface StagingItem {
  id: string
  companyName: string
  jobTitle: string
  statusId: string
  deadline?: string
  selected: boolean
  confidence: number
}

type Phase = 'upload' | 'parsing' | 'review'

// ── Confidence badge ───────────────────────────────────────────────────────────
function confStyle(c: number) {
  if (c >= 90) return { dot: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50' }
  if (c >= 75) return { dot: 'bg-amber-400',   text: 'text-amber-700',   bg: 'bg-amber-50'   }
  return              { dot: 'bg-orange-500',  text: 'text-orange-700',  bg: 'bg-orange-50'  }
}

// ── Component ──────────────────────────────────────────────────────────────────
export function BatchImportModal({ onClose }: { onClose: () => void }) {
  const { statuses, addApplications } = useApp()
  const [phase, setPhase]         = useState<Phase>('upload')
  const [items, setItems]         = useState<StagingItem[]>([])
  const [isDragOver, setDragOver] = useState(false)
  const [parseError, setParseError] = useState<string | null>(null)
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const selectedCount = items.filter((i) => i.selected).length
  const allSelected   = items.length > 0 && items.every((i) => i.selected)

  const toggleAll  = () => setItems((p) => p.map((i) => ({ ...i, selected: !allSelected })))
  const toggle     = (id: string) => setItems((p) => p.map((i) => i.id === id ? { ...i, selected: !i.selected } : i))
  const setStatus  = (id: string, statusId: string) => setItems((p) => p.map((i) => i.id === id ? { ...i, statusId } : i))
  const remove     = (id: string) => setItems((p) => p.filter((i) => i.id !== id))

  // ── File processing ────────────────────────────────────────────────────────
  async function processFile(file: File) {
    if (!file.type.startsWith('image/')) {
      setParseError('请上传图片文件（PNG / JPG）')
      return
    }

    const sizeKB = file.size / 1024
    const sizeStr = sizeKB > 1024
      ? `${(sizeKB / 1024).toFixed(1)} MB`
      : `${Math.round(sizeKB)} KB`
    setUploadedFile({ name: file.name, size: sizeStr })
    setParseError(null)
    setPhase('parsing')

    try {
      // Convert to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
          const result = reader.result as string
          // Strip the "data:image/xxx;base64," prefix
          resolve(result.split(',')[1])
        }
        reader.onerror = reject
        reader.readAsDataURL(file)
      })

      const response = await fetch('/api/parse-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64, mimeType: file.type }),
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: '请求失败' }))
        throw new Error(err.error ?? '服务器错误')
      }

      const { applications } = await response.json()

      if (!applications || applications.length === 0) {
        setParseError('未能从图片中识别到求职记录，请尝试清晰度更高的截图')
        setPhase('upload')
        return
      }

      const stagingItems: StagingItem[] = applications.map(
        (a: { id: string; companyName: string; jobTitle: string; statusId: string; deadline?: string; confidence: number }) => ({
          ...a,
          selected: true,
        })
      )
      setItems(stagingItems)
      setPhase('review')
    } catch (err) {
      console.error(err)
      setParseError(err instanceof Error ? err.message : 'AI 解析失败，请重试')
      setPhase('upload')
    }
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) processFile(file)
    // Reset so the same file can be re-selected
    e.target.value = ''
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) processFile(file)
  }

  const handleImport = async () => {
    const toAdd: Application[] = items
      .filter((i) => i.selected)
      .map((item) => ({
        id:          `imp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        companyName: item.companyName,
        jobTitle:    item.jobTitle,
        statusId:    item.statusId,
        deadline:    item.deadline,
        isArchived:  false,
      }))
    await addApplications(toAdd)
    onClose()
  }

  // ── Step indicator state ──────────────────────────────────────────────────
  const stepIndex = phase === 'upload' ? 0 : phase === 'parsing' ? 1 : 2

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ backgroundColor: 'rgba(15,23,42,0.6)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileInput}
      />
      <div
        className="animate-in w-full bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        style={{ maxWidth: 1000, maxHeight: '88vh' }}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm shadow-blue-300">
              <Sparkles size={15} className="text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">批量解析录入</h2>
              <p className="text-xs text-slate-400">AI 识别截图内容 · 校验后一键入库</p>
            </div>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-1">
            {['上传截图', 'AI 解析', '确认入库'].map((label, i) => (
              <div key={label} className="flex items-center gap-1">
                <div
                  className={clsx(
                    'w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold',
                    i < stepIndex
                      ? 'bg-blue-600 text-white'
                      : i === stepIndex
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-400',
                  )}
                >
                  {i < stepIndex ? <Check size={10} /> : i + 1}
                </div>
                <span className={clsx('text-xs', i <= stepIndex ? 'text-blue-600 font-medium' : 'text-slate-400')}>
                  {label}
                </span>
                {i < 2 && <div className="w-5 h-px bg-slate-200 mx-1" />}
              </div>
            ))}
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="flex flex-1 min-h-0">

          {/* Left: Upload panel */}
          <div className="w-64 flex-shrink-0 border-r border-slate-100 p-5 flex flex-col gap-4 overflow-y-auto">

            {/* Drop zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={clsx(
                'rounded-2xl border-2 border-dashed p-5 text-center cursor-pointer transition-all',
                'flex flex-col items-center justify-center gap-2.5',
                isDragOver
                  ? 'border-blue-400 bg-blue-50 scale-[1.01]'
                  : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50',
              )}
            >
              <div className={clsx('w-11 h-11 rounded-xl flex items-center justify-center transition-colors', isDragOver ? 'bg-blue-100' : 'bg-slate-100')}>
                <Upload size={20} className={isDragOver ? 'text-blue-500' : 'text-slate-400'} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">拖拽截图至此</p>
                <p className="text-xs text-slate-400 mt-0.5">或点击选择文件</p>
              </div>
              <span className="text-xs text-slate-300 bg-slate-100 px-2.5 py-1 rounded-full">
                PNG / JPG
              </span>
            </div>

            {/* Error message */}
            {parseError && (
              <div className="rounded-xl bg-red-50 border border-red-100 p-3 flex items-start gap-2">
                <AlertCircle size={13} className="text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-red-600 leading-relaxed">{parseError}</p>
              </div>
            )}

            {/* Uploaded file card */}
            {uploadedFile && (
              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <div className="h-24 bg-gradient-to-br from-slate-200 via-blue-50 to-indigo-100 flex items-center justify-center relative">
                  {phase === 'parsing' ? (
                    <Loader2 size={24} className="text-blue-400 animate-spin" />
                  ) : (
                    <>
                      <FileImage size={26} className="text-slate-300" />
                      <div className="absolute top-2 right-2 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center shadow-sm">
                        <Check size={10} className="text-white" />
                      </div>
                      <div className="absolute bottom-3 left-3 right-3 space-y-1">
                        <div className="h-1.5 bg-white/60 rounded-full w-4/5" />
                        <div className="h-1.5 bg-white/40 rounded-full w-3/5" />
                        <div className="h-1.5 bg-white/40 rounded-full w-2/3" />
                      </div>
                    </>
                  )}
                </div>
                <div className="px-3 py-2.5 bg-white">
                  <p className="text-xs font-semibold text-slate-700 truncate">{uploadedFile.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {uploadedFile.size} · {phase === 'parsing' ? 'AI 解析中…' : '解析完成'}
                  </p>
                </div>
              </div>
            )}

            {/* Parsing hint */}
            {phase === 'review' && items.length > 0 && (
              <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-3.5">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check size={9} className="text-white" />
                  </div>
                  <span className="text-xs font-semibold text-emerald-700">AI 解析完成</span>
                </div>
                <p className="text-xs text-emerald-600 leading-relaxed">
                  共识别 <span className="font-bold">{items.length}</span> 条投递记录，请在右侧确认后入库
                </p>
              </div>
            )}

            {/* Confidence legend */}
            <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
              <p className="text-xs font-semibold text-slate-500 mb-2">置信度说明</p>
              <div className="space-y-1.5">
                {[
                  ['bg-emerald-500', '高 (≥90%)', '识别结果可信'],
                  ['bg-amber-400',   '中 (75–89%)', '建议复核'],
                  ['bg-orange-500',  '低 (<75%)', '请手动校验'],
                ].map(([dot, level, desc]) => (
                  <div key={level} className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${dot} flex-shrink-0`} />
                    <span className="text-xs text-slate-600 font-medium w-20">{level}</span>
                    <span className="text-xs text-slate-400">{desc}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-auto flex items-start gap-2 p-3 bg-amber-50 rounded-xl border border-amber-100">
              <AlertCircle size={13} className="text-amber-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-700 leading-relaxed">
                低置信度条目建议手动核对公司名与岗位，避免录入错误
              </p>
            </div>
          </div>

          {/* Right: Content area */}
          <div className="flex-1 flex flex-col min-w-0">

            {/* Upload placeholder / Parsing spinner */}
            {phase !== 'review' && (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-12 gap-5">
                {phase === 'parsing' ? (
                  <>
                    <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center">
                      <Loader2 size={28} className="text-blue-500 animate-spin" />
                    </div>
                    <div>
                      <p className="text-base font-semibold text-slate-700">AI 正在解析截图…</p>
                      <p className="text-sm text-slate-400 mt-1">智谱 GLM-4V 识别中，请稍候</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center">
                      <FileImage size={28} className="text-slate-300" />
                    </div>
                    <div>
                      <p className="text-base font-semibold text-slate-600">上传截图后显示解析结果</p>
                      <p className="text-sm text-slate-400 mt-1">支持投递平台截图、招聘邮件截图等</p>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Table (only in review phase) */}
            {phase === 'review' && (
              <>
                {/* Table toolbar */}
                <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between flex-shrink-0 bg-white">
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-bold text-slate-800">校验并确认</p>
                    <span className="text-xs text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full">
                      已选 {selectedCount} / {items.length}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span>可直接修改「识别状态」下拉框</span>
                    <span>·</span>
                    <span>悬停行可删除</span>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead className="sticky top-0 z-10 bg-slate-50">
                      <tr className="border-b border-slate-200">
                        <th className="w-10 px-4 py-3 text-left">
                          <input
                            type="checkbox"
                            checked={allSelected}
                            onChange={toggleAll}
                            className="w-3.5 h-3.5 rounded accent-blue-600 cursor-pointer"
                          />
                        </th>
                        {['公司名称', '岗位名称', '识别状态', '置信度', ''].map((h) => (
                          <th
                            key={h}
                            className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {items.map((item) => {
                        const cs = confStyle(item.confidence)
                        return (
                          <tr
                            key={item.id}
                            className={clsx(
                              'group transition-colors duration-100',
                              item.selected ? 'bg-blue-50/40 hover:bg-blue-50/70' : 'bg-white hover:bg-slate-50',
                            )}
                          >
                            <td className="px-4 py-3.5">
                              <input
                                type="checkbox"
                                checked={item.selected}
                                onChange={() => toggle(item.id)}
                                className="w-3.5 h-3.5 rounded accent-blue-600 cursor-pointer"
                              />
                            </td>
                            <td className="px-3 py-3.5">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-md bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-xs font-bold text-slate-600 flex-shrink-0">
                                  {item.companyName.slice(0, 1)}
                                </div>
                                <span className="font-semibold text-slate-800">{item.companyName}</span>
                              </div>
                            </td>
                            <td className="px-3 py-3.5 text-slate-600 max-w-xs truncate">
                              {item.jobTitle}
                            </td>
                            <td className="px-3 py-3.5 w-32">
                              <div className="relative">
                                <select
                                  value={item.statusId}
                                  onChange={(e) => setStatus(item.id, e.target.value)}
                                  className="w-full appearance-none bg-white border border-slate-200 hover:border-blue-300 text-slate-700 text-xs rounded-lg px-2.5 py-1.5 pr-7 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition-colors"
                                >
                                  {statuses.map((s) => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                  ))}
                                </select>
                                <ChevronDown size={11} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400" />
                              </div>
                            </td>
                            <td className="px-3 py-3.5 w-24">
                              <span className={clsx('inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold', cs.bg, cs.text)}>
                                <span className={clsx('w-1.5 h-1.5 rounded-full flex-shrink-0', cs.dot)} />
                                {item.confidence}%
                              </span>
                            </td>
                            <td className="px-3 py-3.5 w-12">
                              <button
                                onClick={() => remove(item.id)}
                                className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                              >
                                <Trash2 size={13} />
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>

                  {items.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <Database size={28} className="text-slate-200 mb-3" />
                      <p className="text-sm text-slate-400">所有条目已删除</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/60 flex-shrink-0">
          <p className="text-xs text-slate-400">
            入库后将追加至「求职看板」对应列，不会覆盖已有数据
          </p>
          <div className="flex gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleImport}
              disabled={selectedCount === 0 || phase !== 'review'}
              className={clsx(
                'flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-xl transition-all',
                selectedCount > 0 && phase === 'review'
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-300/40'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed',
              )}
            >
              <Check size={14} />
              一键入库（{selectedCount} 项）
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
