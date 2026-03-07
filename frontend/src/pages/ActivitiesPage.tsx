import { useEffect, useState } from 'react'
import { useAcquisitionsPolling } from '@/features/acquisitions/hooks/useAcquisitionsPolling'
import { OreFindingsChart } from '@/features/acquisitions/components/OreFindingsChart'
import { TimeDistributionChart } from '@/features/acquisitions/components/TimeDistributionChart'
import { Button } from '@/shared/ui/button'
import type { Acquisition } from '@/shared/api/endpoints'

function formatUptime(ms: number): string {
  const s = Math.floor(ms / 1000)
  const m = Math.floor(s / 60)
  const h = Math.floor(m / 60)
  if (h > 0) return `${h}h ${m % 60}m`
  if (m > 0) return `${m}m ${s % 60}s`
  return `${s}s`
}

function totalOreSitesToday(acquisitions: Acquisition[]): number {
  const today = new Date().toISOString().slice(0, 10)
  return acquisitions
    .filter((a) => new Date(a.timestamp * 1000).toISOString().slice(0, 10) === today)
    .reduce((sum, a) => sum + a.ore_sites, 0)
}

function lastOreFound(acquisitions: Acquisition[]): string {
  if (!acquisitions.length) return '—'
  const latest = Math.max(...acquisitions.map((a) => a.timestamp))
  const d = new Date(latest * 1000)
  const now = Date.now() / 1000
  const diff = now - latest
  if (diff < 60) return 'Just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return d.toLocaleString()
}

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
    if (!connectedSince || error) {
      setUptime(error ? 'Offline' : '—')
      return
    }
    const tick = () => setUptime(formatUptime(Date.now() - connectedSince))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [connectedSince, error])

  if (error) {
    return (
      <div className="space-y-4 pt-4">
        <h1 className="text-2xl">
          <span className="font-bold">Activities</span>
          <span className="font-thin text-lg"> | Satellite and resource operations</span>
        </h1>
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
        <h1 className="text-2xl">
          <span className="font-bold">Activities</span>
          <span className="font-thin text-lg"> | Satellite and resource operations</span>
        </h1>
        <p className="text-muted-foreground">Loading ore acquisition data…</p>
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 pt-4">
      <div className="flex shrink-0 items-center justify-between pb-6">
        <h1 className="text-2xl">
          <span className="font-bold">Activities</span>
          <span className="font-thin text-lg"> | Satellite and resource operations</span>
        </h1>
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
          <p className="text-lg font-semibold text-sky-400 dark:text-sky-300">{error ? 'Offline' : 'Operational'}</p>
        </div>
        <div className="shrink-0 rounded-lg border border-border bg-card px-4 py-3">
          <p className="text-sm text-muted-foreground">Satellite Uptime</p>
          <p className="text-lg font-semibold text-sky-400 dark:text-sky-300">{uptime}</p>
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
          <p className="text-lg font-semibold text-white/80">{lastOreFound(acquisitions)}</p>
        </div>
        <div className="shrink-0 rounded-lg border border-border bg-card px-4 py-3">
          <p className="text-sm text-muted-foreground">Total Scans</p>
          <p className="text-lg font-semibold text-white/80">{acquisitions.length}</p>
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
