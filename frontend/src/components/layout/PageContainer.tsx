import { type ReactNode, useState } from 'react'
import { Header } from './Header'
import { Sidebar } from './Sidebar'

interface PageContainerProps {
  children: ReactNode
  sidebar?: ReactNode
}

export function PageContainer({ children, sidebar }: PageContainerProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="h-screen flex flex-col bg-[var(--bg-primary)]">
      <Header onMenuClick={() => setSidebarOpen(true)} showMenuButton={!!sidebar} />
      <div className="flex-1 flex overflow-hidden">
        {sidebar && (
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)}>
            {sidebar}
          </Sidebar>
        )}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
