import { Activity, FileText, Settings, X } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useLayout } from './LayoutContext'
import { cn } from '@/shared/utils/cn'

function formatLoginSince(ts: number): string {
  const d = new Date(ts)
  const now = new Date()
  const sameDay = d.toDateString() === now.toDateString()
  return sameDay
    ? `Logged in at ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    : `Logged in ${d.toLocaleDateString()}`
}

function getInitials(userId: string): string {
  const parts = userId.trim().split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase().slice(0, 2)
  }
  return userId.slice(0, 2).toUpperCase()
}

function getDisplayName(userId: string): string {
  return userId
    .split(/[-_\s]/)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase())
    .join(' ')
}

const navItems = [
  { to: '/activities', label: 'Activities', icon: Activity },
  { to: '/reports', label: 'Reporting', icon: FileText },
  { to: '/settings', label: 'Settings', icon: Settings },
] as const

export function Sidebar() {
  const { userId, loginAt, logout } = useAuth()
  const layout = useLayout()

  return (
    <aside
      className={cn(
        'flex h-full flex-col border-r border-border bg-sidebar px-4 py-6',
        layout?.isMobile ? 'w-full' : 'w-56'
      )}
      aria-label="Main navigation"
    >
      <div className="mb-8 flex items-start justify-between gap-2">
        <div className="min-w-0">
        <Link
          to="/activities"
          className="block text-2xl font-bold tracking-tight text-foreground transition-colors hover:text-mars-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar rounded md:text-xl"
        >
          L4RV1S
        </Link>
        <p className="mt-0.5 text-base text-muted-foreground md:text-sm">
          Hell-O hoo-man!
        </p>
        </div>
        {layout?.isMobile && (
          <button
            type="button"
            onClick={layout.closeSidebar}
            aria-label="Close menu"
            className="shrink-0 rounded p-3 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:p-2"
          >
            <X className="size-6 md:size-5" />
          </button>
        )}
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => layout?.isMobile && layout.closeSidebar()}
            className={({ isActive }) =>
              cn(
                'flex min-h-12 items-center gap-3 rounded px-3 py-4 text-base font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar md:min-h-0 md:gap-2.5 md:py-2 md:text-sm',
                isActive
                  ? 'border border-input bg-background text-mars-500 dark:border-transparent dark:bg-black/80 dark:text-mars-500'
                  : 'border border-transparent text-foreground hover:bg-accent hover:text-accent-foreground dark:text-white'
              )
            }
          >
            <Icon className="size-5 shrink-0 md:size-4" aria-hidden />
            {label}
          </NavLink>
        ))}
      </nav>

      {userId && (
        <div className="mt-auto flex shrink-0 items-center gap-4 py-3 md:gap-3 md:py-2.5">
          <div
            className="flex size-12 shrink-0 items-center justify-center rounded-full bg-muted text-base font-semibold text-foreground md:size-10 md:text-sm"
            aria-hidden
          >
            {getInitials(userId)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-medium text-foreground md:text-sm">
              {getDisplayName(userId)}
            </p>
            <p className="truncate text-sm text-muted-foreground md:text-xs">
              {loginAt ? formatLoginSince(loginAt) : 'Logged in'}
            </p>
            <button
              type="button"
              onClick={logout}
              className="mt-1.5 text-sm text-mars-500 transition-colors hover:text-mars-600 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar rounded md:mt-1 md:text-xs"
            >
              Log out
            </button>
          </div>
        </div>
      )}
    </aside>
  )
}
