import type { Acquisition } from '@/shared/api/endpoints'

export type GroupBy = 'day' | 'week' | 'month' | 'year'

export interface ChartDataPoint {
  period: string
  label: string
  oreSites: number
  scanCount: number
}

const MS_PER_DAY = 86400

function startOfWeek(ts: number): number {
  const d = new Date(ts * 1000)
  const day = d.getUTCDay()
  const diff = (day === 0 ? -6 : 1) - day
  d.setUTCDate(d.getUTCDate() + diff)
  d.setUTCHours(0, 0, 0, 0)
  return Math.floor(d.getTime() / 1000)
}

function getBucketKey(ts: number, groupBy: GroupBy): string {
  const d = new Date(ts * 1000)
  switch (groupBy) {
    case 'day':
      return d.toISOString().slice(0, 10)
    case 'week': {
      const start = startOfWeek(ts)
      return new Date(start * 1000).toISOString().slice(0, 10)
    }
    case 'month':
      return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
    case 'year':
      return String(d.getUTCFullYear())
    default:
      return String(ts)
  }
}

function formatLabel(key: string, groupBy: GroupBy): string {
  switch (groupBy) {
    case 'day':
      return new Date(key).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    case 'week': {
      const d = new Date(key)
      const end = new Date(d)
      end.setDate(end.getDate() + 6)
      return `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
    }
    case 'month':
      return new Date(key + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    case 'year':
      return key
    default:
      return key
  }
}

const BARS_PER_VIEW: Record<GroupBy, number> = {
  day: 14,
  week: 8,
  month: 12,
  year: 5,
}

export function groupAcquisitions(
  acquisitions: Acquisition[],
  groupBy: GroupBy,
  windowOffset: number
): { data: ChartDataPoint[]; canPrev: boolean; canNext: boolean } {
  if (!acquisitions.length) {
    return { data: [], canPrev: false, canNext: false }
  }

  const buckets = new Map<string, { oreSites: number; scanCount: number }>()
  for (const a of acquisitions) {
    const key = getBucketKey(a.timestamp, groupBy)
    const existing = buckets.get(key) ?? { oreSites: 0, scanCount: 0 }
    existing.oreSites += a.ore_sites
    existing.scanCount += 1
    buckets.set(key, existing)
  }

  const keys = Array.from(buckets.keys()).sort()
  if (!keys.length) return { data: [], canPrev: false, canNext: false }

  const step = Math.min(BARS_PER_VIEW[groupBy], keys.length)
  const totalBuckets = keys.length
  const maxStart = Math.max(0, totalBuckets - step)
  const startIdx = Math.max(0, Math.min(maxStart, maxStart + windowOffset))
  const endIdx = Math.min(totalBuckets, startIdx + step)

  const canPrev = startIdx > 0
  const canNext = windowOffset < 0

  const windowKeys = keys.slice(startIdx, endIdx)
  const data: ChartDataPoint[] = windowKeys.map((key) => {
    const b = buckets.get(key)!
    return {
      period: key,
      label: formatLabel(key, groupBy),
      oreSites: b.oreSites,
      scanCount: b.scanCount,
    }
  })

  return { data, canPrev, canNext }
}

/**
 * Returns acquisitions for exactly ONE period (1 day, 1 week, 1 month, or 1 year).
 * periodOffset: 0 = most recent, -1 = previous, etc.
 */
export function filterAcquisitionsForSinglePeriod(
  acquisitions: Acquisition[],
  groupBy: GroupBy,
  periodOffset: number
): { acquisitions: Acquisition[]; label: string; canPrev: boolean; canNext: boolean } {
  if (!acquisitions.length) {
    return { acquisitions: [], label: '', canPrev: false, canNext: false }
  }
  const buckets = new Map<string, Acquisition[]>()
  for (const a of acquisitions) {
    const key = getBucketKey(a.timestamp, groupBy)
    const arr = buckets.get(key) ?? []
    arr.push(a)
    buckets.set(key, arr)
  }
  const keys = Array.from(buckets.keys()).sort()
  const idx = keys.length - 1 + periodOffset
  if (idx < 0 || idx >= keys.length) {
    return { acquisitions: [], label: '', canPrev: idx < 0, canNext: periodOffset < 0 }
  }
  const periodKey = keys[idx]
  const periodAcqs = buckets.get(periodKey) ?? []
  return {
    acquisitions: periodAcqs,
    label: formatLabel(periodKey, groupBy),
    canPrev: idx > 0,
    canNext: periodOffset < 0,
  }
}

/** Returns acquisitions that fall within the current time window. */
export function filterAcquisitionsByWindow(
  acquisitions: Acquisition[],
  groupBy: GroupBy,
  windowOffset: number
): Acquisition[] {
  if (!acquisitions.length) return []
  const buckets = new Map<string, Acquisition[]>()
  for (const a of acquisitions) {
    const key = getBucketKey(a.timestamp, groupBy)
    const arr = buckets.get(key) ?? []
    arr.push(a)
    buckets.set(key, arr)
  }
  const keys = Array.from(buckets.keys()).sort()
  const step = Math.min(BARS_PER_VIEW[groupBy], keys.length)
  const totalBuckets = keys.length
  const maxStart = Math.max(0, totalBuckets - step)
  const startIdx = Math.max(0, Math.min(maxStart, maxStart + windowOffset))
  const endIdx = Math.min(totalBuckets, startIdx + step)
  const windowKeys = new Set(keys.slice(startIdx, endIdx))
  return acquisitions.filter((a) => windowKeys.has(getBucketKey(a.timestamp, groupBy)))
}

export interface CompareDataPoint {
  period: string
  label: string
  oreSitesCurrent: number
  oreSitesPrevious: number
}

/** Returns current-period vs previous-period data for comparison charts. */
export function groupAcquisitionsCompare(
  acquisitions: Acquisition[],
  groupBy: GroupBy,
  windowOffset: number
): { data: CompareDataPoint[]; canPrev: boolean; canNext: boolean } {
  const step = BARS_PER_VIEW[groupBy]
  if (!acquisitions.length) {
    return { data: [], canPrev: false, canNext: false }
  }

  const buckets = new Map<string, { oreSites: number; scanCount: number }>()
  for (const a of acquisitions) {
    const key = getBucketKey(a.timestamp, groupBy)
    const existing = buckets.get(key) ?? { oreSites: 0, scanCount: 0 }
    existing.oreSites += a.ore_sites
    existing.scanCount += 1
    buckets.set(key, existing)
  }

  const keys = Array.from(buckets.keys()).sort()
  if (!keys.length) return { data: [], canPrev: false, canNext: false }

  const totalBuckets = keys.length
  const maxStart = Math.max(0, totalBuckets - step)
  const startIdx = Math.max(0, Math.min(maxStart, maxStart + windowOffset))
  const endIdx = Math.min(totalBuckets, startIdx + step)

  const canPrev = startIdx > 0
  const canNext = windowOffset < 0

  const currentKeys = keys.slice(startIdx, endIdx)
  const prevStartIdx = Math.max(0, startIdx - step)
  const prevEndIdx = startIdx
  const previousKeys = keys.slice(prevStartIdx, prevEndIdx)

  const data: CompareDataPoint[] = currentKeys.map((key, i) => {
    const current = buckets.get(key)!
    const prevKey = previousKeys[i]
    const prev = prevKey ? buckets.get(prevKey) : undefined
    return {
      period: key,
      label: formatLabel(key, groupBy),
      oreSitesCurrent: current.oreSites,
      oreSitesPrevious: prev?.oreSites ?? 0,
    }
  })

  return { data, canPrev, canNext }
}

export function getAvailableGroupBy(acquisitions: Acquisition[]): GroupBy[] {
  if (!acquisitions.length) return ['day']
  const timestamps = acquisitions.map((a) => a.timestamp)
  const minTs = Math.min(...timestamps)
  const maxTs = Math.max(...timestamps)
  const spanDays = (maxTs - minTs) / MS_PER_DAY

  const options: GroupBy[] = ['day']
  if (spanDays >= 7) options.push('week')
  if (spanDays >= 31) options.push('month')
  if (spanDays >= 365) options.push('year')
  return options
}
