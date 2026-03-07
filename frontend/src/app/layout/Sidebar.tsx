import { NavLink } from 'react-router-dom'
import { cn } from '@/shared/utils/cn'

const navItems = [
  { to: '/activities', label: 'Activities' },
  { to: '/reports', label: 'Reports' },
  { to: '/space-command', label: 'Space Command' },
  { to: '/settings', label: 'Settings' },
] as const

export function Sidebar() {
  return (
    <aside
      className="flex w-56 flex-col border-r border-border bg-sidebar px-4 py-6"
      aria-label="Main navigation"
    >
      <div className="mb-8">
        <div className="text-xl font-bold tracking-tight text-foreground">
          Larvis
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Mars Station Assistant
        </p>
      </div>

      <nav className="flex flex-col gap-1">
        {navItems.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-mars-500/20 text-mars-500 dark:bg-mars-500/20 dark:text-mars-500'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
