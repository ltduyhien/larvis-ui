import { useAcquisitionsPolling } from '@/features/acquisitions/hooks/useAcquisitionsPolling'
import { Button } from '@/shared/ui/button'

export function DashboardPage() {
  const {
    acquisitions,
    isLoading,
    error,
    hasNewData,
    dismissNewData,
    refresh,
  } = useAcquisitionsPolling()

  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
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
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Loading ore acquisition data…</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
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

      <p className="text-muted-foreground">
        {acquisitions.length} scan{acquisitions.length !== 1 ? 's' : ''} recorded.
        {acquisitions.length > 0 && (
          <> Total ore sites across all scans: {acquisitions.reduce((sum, a) => sum + a.ore_sites, 0)}</>
        )}
      </p>
    </div>
  )
}
