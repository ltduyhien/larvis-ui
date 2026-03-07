import { useEffect, useState } from 'react'
import { useAcquisitionsPolling } from '@/features/acquisitions/hooks/useAcquisitionsPolling'
import { OreFindingsChart } from '@/features/acquisitions/components/OreFindingsChart'
import { TimeDistributionChart } from '@/features/acquisitions/components/TimeDistributionChart'
import {
  formatUptime,
  totalOreSitesToday,
  lastOreFound,
} from '@/features/acquisitions/utils/format'
import { Button } from '@/shared/ui/button'

const ACTIVITIES_HEADER = (
  <h1 className="text-2xl">
    <span className="font-bold">Activities</span>
    <span className="font-thin text-lg"> | Satellite and resource operations</span>
  </h1>
)

export function ActivitiesPage() {
  const {
    acquisitions,
    isLoading,
    error,
    hasNewData,
    connectedSince,
    dismissNewData,
    refresh,
  } = useAcquisitionsPolling()

  const [uptime, setUptime] = useState<string>('—')
  useEffect(() => {
    if (!connectedSince || error) return
    const tick = () => setUptime(formatUptime(Date.now() - connectedSince))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [connectedSince, error])

  const displayUptime = !connectedSince || error ? (error ? 'Offline' : '—') : uptime

  if (error) {
    return (
      <div className="space-y-4 pt-4">
        {ACTIVITIES_HEADER}
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-destructive">
          Failed to load: {error.message}
        </div>
        <Button variant="outline" size="sm" onClick={() => refresh()}>
          Retry
        </Button>
      </div>
    )
  }

  if (isLoading && acquisitions.length === 0) {
    return (
      <div className="pt-4">
        {ACTIVITIES_HEADER}
        <p className="text-muted-foreground">Loading ore acquisition data…</p>
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 pt-4">
      <div className="flex shrink-0 items-center justify-between pb-6">
        {ACTIVITIES_HEADER}
      </div>

      {hasNewData && (
        <div
          className="flex items-center justify-between gap-4 rounded-lg border border-mars-500/50 bg-mars-500/10 px-4 py-3"
          role="alert"
        >
          <p className="text-sm font-medium text-foreground">
            New ore findings detected. Refresh to see the latest data.
          </p>
          <div className="flex shrink-0 gap-2">
            <Button variant="outline" size="sm" onClick={dismissNewData}>
              Dismiss
            </Button>
            <Button variant="mars" size="sm" onClick={refresh}>
              Refresh
            </Button>
          </div>
        </div>
      )}

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-hidden sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        <div className="shrink-0 rounded-lg border border-border bg-card px-4 py-3">
          <p className="text-sm text-muted-foreground">Satellite Status</p>
          <p className="text-lg font-semibold text-sky-500 dark:text-[oklch(0.72_0.12_230)]">{error ? 'Offline' : 'Operational'}</p>
        </div>
        <div className="shrink-0 rounded-lg border border-border bg-card px-4 py-3">
          <p className="text-sm text-muted-foreground">Satellite Uptime</p>
          <p className="text-lg font-semibold text-sky-500 dark:text-[oklch(0.72_0.12_230)]">{displayUptime}</p>
        </div>
        <div className="shrink-0 rounded-lg border border-border bg-card px-4 py-3">
          <p className="text-sm text-muted-foreground">Total Ore Sites</p>
          <p className="text-lg font-semibold text-mars-500">
            {acquisitions.reduce((sum, a) => sum + a.ore_sites, 0)}
          </p>
        </div>
        <div className="shrink-0 rounded-lg border border-border bg-card px-4 py-3">
          <p className="text-sm text-muted-foreground">Ore Discovery Today</p>
          <p className="text-lg font-semibold text-mars-500">{totalOreSitesToday(acquisitions)}</p>
        </div>
        <div className="shrink-0 rounded-lg border border-border bg-card px-4 py-3">
          <p className="text-sm text-muted-foreground">Last Ore Discovery</p>
          <p className="text-lg font-semibold text-foreground">{lastOreFound(acquisitions)}</p>
        </div>
        <div className="shrink-0 rounded-lg border border-border bg-card px-4 py-3">
          <p className="text-sm text-muted-foreground">Total Scans</p>
          <p className="text-lg font-semibold text-foreground">{acquisitions.length}</p>
        </div>
        <div className="flex min-h-0 flex-col overflow-hidden rounded-lg border border-border bg-card p-6 sm:col-span-2 md:col-span-3 lg:col-span-3">
          <div className="min-h-0 flex-1">
            <OreFindingsChart acquisitions={acquisitions} title="Ore Discoveries" />
          </div>
        </div>
        <div className="flex min-h-0 flex-col overflow-hidden rounded-lg border border-border bg-card p-6 sm:col-span-2 md:col-span-3 lg:col-span-3">
          <h2 className="mb-4 shrink-0 text-lg font-semibold">Time Distribution for Ore Discovery</h2>
          <div className="min-h-0 flex-1">
            <TimeDistributionChart acquisitions={acquisitions} />
          </div>
        </div>
      </div>
    </div>
  )
}
