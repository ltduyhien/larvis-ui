// MainLayout.tsx: Layout shell for authenticated pages (dashboard, users, report).
// Sidebar navigation on the left, content area on the right.
// Placeholder for now — will be fleshed out when we build the dashboard.

import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'

export function MainLayout() {
  return (
    <div className="flex h-svh max-h-svh overflow-hidden bg-background text-foreground">
      {/* flex: Horizontal layout (sidebar + content side by side).
          min-h-svh: Fill at least the full viewport height.
          bg-background text-foreground: Use shadcn's theme-aware CSS variables. */}

      <Sidebar />

      <main className="flex min-h-0 flex-1 flex-col overflow-hidden px-10 py-6 [&>*]:min-h-0">
        {/* flex-1: Take all remaining horizontal space after the sidebar.
            px-10 py-6: horizontal and vertical padding for the content area. */}
        <Outlet />
        {/* Outlet: The page component (DashboardPage, UsersPage, etc.) renders here. */}
      </main>
    </div>
  )
}
