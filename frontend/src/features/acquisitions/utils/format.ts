import type { Acquisition } from '@/shared/api/endpoints'

export function formatUptime(ms: number): string {
  const s = Math.floor(ms / 1000)
  const m = Math.floor(s / 60)
  const h = Math.floor(m / 60)
  if (h > 0) return `${h}h ${m % 60}m`
  if (m > 0) return `${m}m ${s % 60}s`
  return `${s}s`
}

export function totalOreSitesToday(acquisitions: Acquisition[]): number {
  const today = new Date().toISOString().slice(0, 10)
  return acquisitions
    .filter((a) => new Date(a.timestamp * 1000).toISOString().slice(0, 10) === today)
    .reduce((sum, a) => sum + a.ore_sites, 0)
}

export function acquisitionsThisMonth(acquisitions: Acquisition[]): Acquisition[] {
  const now = new Date()
  return acquisitionsForMonth(acquisitions, now.getUTCFullYear(), now.getUTCMonth())
}

export function acquisitionsForMonth(
  acquisitions: Acquisition[],
  year: number,
  month: number
): Acquisition[] {
  return acquisitions.filter((a) => {
    const d = new Date(a.timestamp * 1000)
    return d.getUTCFullYear() === year && d.getUTCMonth() === month
  })
}

export function totalOreSitesThisMonth(acquisitions: Acquisition[]): number {
  return acquisitionsThisMonth(acquisitions).reduce((sum, a) => sum + a.ore_sites, 0)
}

export function totalScansThisMonth(acquisitions: Acquisition[]): number {
  return acquisitionsThisMonth(acquisitions).length
}

export function uniqueDaysThisMonth(acquisitions: Acquisition[]): number {
  const days = new Set(
    acquisitionsThisMonth(acquisitions).map((a) =>
      new Date(a.timestamp * 1000).toISOString().slice(0, 10)
    )
  )
  return days.size
}

export function avgOreSitesPerScan(acquisitions: Acquisition[]): string {
  const month = acquisitionsThisMonth(acquisitions)
  if (!month.length) return '—'
  const avg = month.reduce((sum, a) => sum + a.ore_sites, 0) / month.length
  return avg.toFixed(1)
}

export function totalOreSitesForMonth(
  acquisitions: Acquisition[],
  year: number,
  month: number
): number {
  return acquisitionsForMonth(acquisitions, year, month).reduce(
    (sum, a) => sum + a.ore_sites,
    0
  )
}

export function totalScansForMonth(
  acquisitions: Acquisition[],
  year: number,
  month: number
): number {
  return acquisitionsForMonth(acquisitions, year, month).length
}

export function uniqueDaysForMonth(
  acquisitions: Acquisition[],
  year: number,
  month: number
): number {
  const days = new Set(
    acquisitionsForMonth(acquisitions, year, month).map((a) =>
      new Date(a.timestamp * 1000).toISOString().slice(0, 10)
    )
  )
  return days.size
}

export function avgOreSitesPerScanForMonth(
  acquisitions: Acquisition[],
  year: number,
  month: number
): string {
  const m = acquisitionsForMonth(acquisitions, year, month)
  if (!m.length) return '—'
  const avg = m.reduce((sum, a) => sum + a.ore_sites, 0) / m.length
  return avg.toFixed(1)
}

export function lastOreFound(acquisitions: Acquisition[]): string {
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
