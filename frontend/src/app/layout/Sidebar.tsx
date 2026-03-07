import { Activity, FileText, Settings } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/useAuth'
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

  return (
    <aside
      className="flex w-56 flex-col border-r border-border bg-sidebar px-4 py-6"
      aria-label="Main navigation"
    >
      <div className="mb-8">
        <Link
          to="/activities"
          className="block text-xl font-bold tracking-tight text-foreground transition-colors hover:text-mars-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar rounded"
        >
          L4RV1S
        </Link>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Hell-O hoo-man!
        </p>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar',
                isActive
                  ? 'border border-input bg-background text-mars-500 dark:border-transparent dark:bg-black/80 dark:text-mars-500'
                  : 'border border-transparent text-foreground hover:bg-accent hover:text-accent-foreground dark:text-white'
              )
            }
          >
            <Icon className="size-4 shrink-0" aria-hidden />
            {label}
          </NavLink>
        ))}
      </nav>

      {userId && (
        <div className="mt-auto flex shrink-0 items-center gap-3 py-2.5">
          <div
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold text-foreground"
            aria-hidden
          >
            {getInitials(userId)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">
              {getDisplayName(userId)}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {loginAt ? formatLoginSince(loginAt) : 'Logged in'}
            </p>
            <button
              type="button"
              onClick={logout}
              className="mt-1 text-xs text-mars-500 transition-colors hover:text-mars-600 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar rounded"
            >
              Log out
            </button>
          </div>
        </div>
      )}
    </aside>
  )
}
