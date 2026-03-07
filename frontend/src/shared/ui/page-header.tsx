import { Menu } from 'lucide-react'
import { useLayout } from '@/app/layout/LayoutContext'
import { UtcTime } from './utc-time'

interface PageHeaderProps {
  title: string
  subtitle: string
}

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  const layout = useLayout()

  return (
    <div className="flex shrink-0 items-center justify-between gap-2 mb-2 md:mb-4">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        {layout?.isMobile && (
          <button
            type="button"
            onClick={layout.openSidebar}
            aria-label="Open menu"
            className="shrink-0 rounded p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Menu className="size-5" />
          </button>
        )}
        <h1 className="min-w-0 truncate text-lg">
          <span className="font-bold">{title}</span>
          {!layout?.isMobile && (
            <span className="font-normal"> | {subtitle}</span>
          )}
        </h1>
      </div>
      <UtcTime />
    </div>
  )
}
