// MainLayout.tsx: Layout shell for authenticated pages (dashboard, users, report).
// Sidebar navigation on the left, content area on the right.
// On mobile: sidebar is hidden; menu icon in page header opens it as full-width overlay.

import { Outlet } from 'react-router-dom'
import { LayoutProvider, useLayout } from './LayoutContext'
import { Sidebar } from './Sidebar'
import { cn } from '@/shared/utils/cn'

function MainLayoutInner() {
  const layout = useLayout()!

  return (
    <div className="flex h-svh max-h-svh overflow-hidden bg-background text-foreground">
      {/* Skip link: visible on focus for keyboard users (WCAG 2.4.1) */}
      <a
        href="#main-content"
        className="sr-only focus-visible:not-sr-only focus-visible:absolute focus-visible:left-4 focus-visible:top-4 focus-visible:z-50 focus-visible:rounded focus-visible:bg-primary focus-visible:px-4 focus-visible:py-2 focus-visible:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Skip to main content
      </a>

      {/* Sidebar: visible on desktop; fixed overlay on mobile when open */}
      <div
        className={cn(
          'flex flex-col border-r border-border bg-sidebar',
          layout.isMobile
            ? 'fixed inset-y-0 left-0 right-0 z-50 w-full transition-transform duration-200 ease-out'
            : 'w-56 shrink-0'
        )}
        style={
          layout.isMobile
            ? { transform: layout.isSidebarOpen ? 'translateX(0)' : 'translateX(-100%)' }
            : undefined
        }
        aria-hidden={layout.isMobile && !layout.isSidebarOpen}
      >
        <Sidebar />
      </div>

      {/* Mobile sidebar backdrop */}
      {layout.isMobile && layout.isSidebarOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={layout.closeSidebar}
        />
      )}

      <main
        id="main-content"
        className="my-2 flex min-h-0 flex-1 flex-col overflow-hidden px-4 md:my-6 md:px-10 [&>*]:min-h-0"
        tabIndex={-1}
      >
        <Outlet />
      </main>
    </div>
  )
}

export function MainLayout() {
  return (
    <LayoutProvider>
      <MainLayoutInner />
    </LayoutProvider>
  )
}
