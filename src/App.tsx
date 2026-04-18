import { useState } from 'react'
import { AppProvider, useApp } from './context/AppContext'
import { Sidebar } from './components/layout/Sidebar'
import { Header } from './components/layout/Header'
import { OverviewPage } from './pages/OverviewPage'
import { KanbanPage } from './pages/KanbanPage'
import { ReviewPage } from './pages/ReviewPage'
import { BatchImportModal } from './components/batch/BatchImportModal'

function AppContent() {
  const { currentPage, loading } = useApp()
  const [showBatchImport, setShowBatchImport] = useState(false)

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-400">加载数据中…</p>
        </div>
      </div>
    )
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'overview': return <OverviewPage />
      case 'kanban':   return <KanbanPage />
      case 'review':   return <ReviewPage />
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar />

      <div className="flex-1 ml-64 flex flex-col min-w-0">
        <Header onBatchImport={() => setShowBatchImport(true)} />
        <main className="flex-1 mt-16 overflow-y-auto">
          {renderPage()}
        </main>
      </div>

      {showBatchImport && (
        <BatchImportModal onClose={() => setShowBatchImport(false)} />
      )}
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}
