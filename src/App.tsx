import { useState } from 'react'
import { AppProvider, useApp } from './context/AppContext'
import { Sidebar } from './components/layout/Sidebar'
import { Header } from './components/layout/Header'
import { OverviewPage } from './pages/OverviewPage'
import { KanbanPage } from './pages/KanbanPage'
import { ReviewPage } from './pages/ReviewPage'
import { BatchImportModal } from './components/batch/BatchImportModal'

function AppContent() {
  const { currentPage } = useApp()
  const [showBatchImport, setShowBatchImport] = useState(false)

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
