import { useState, useMemo } from 'react'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import type { Acquisition } from '@/shared/api/endpoints'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/shared/ui/chart'
import { cn } from '@/shared/utils/cn'
import { GroupByControls } from './GroupByControls'
import {
  filterAcquisitionsForSinglePeriod,
  getAvailableGroupBy,
  type GroupBy,
} from '../utils/groupAcquisitions'

const chartConfig = {
  period: { label: 'Period' },
  percentage: {
    label: '%',
    color: 'var(--color-mars-500)',
  },
} satisfies ChartConfig

function toPercent(part: number, total: number, decimals = 1): number {
  return Math.round((part / total) * Math.pow(10, decimals + 2)) / Math.pow(10, decimals)
}

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

type DistributionPoint = { label: string; acquisitions: number; oreSites: number; percentage: number }

function distributionByGroupBy(
  acquisitions: Acquisition[],
  groupBy: GroupBy
): DistributionPoint[] {
  const totalOreSites =
    acquisitions.reduce((sum, a) => sum + a.ore_sites, 0) || 1
  if (groupBy === 'day') {
    const buckets = Array.from({ length: 24 }, () => ({ count: 0, oreSites: 0 }))
    for (const a of acquisitions) {
      const h = new Date(a.timestamp * 1000).getUTCHours()
      buckets[h].count += 1
      buckets[h].oreSites += a.ore_sites
    }
    return buckets.map((b, hour) => ({
      label: `${hour.toString().padStart(2, '0')}:00`,
      acquisitions: b.count,
      oreSites: b.oreSites,
      percentage: toPercent(b.oreSites, totalOreSites),
    }))
  }
  if (groupBy === 'week') {
    const buckets = Array.from({ length: 7 }, () => ({ count: 0, oreSites: 0 }))
    for (const a of acquisitions) {
      const day = new Date(a.timestamp * 1000).getUTCDay()
      const idx = day === 0 ? 6 : day - 1
      buckets[idx].count += 1
      buckets[idx].oreSites += a.ore_sites
    }
    return buckets.map((b, i) => ({
      label: DAY_NAMES[i],
      acquisitions: b.count,
      oreSites: b.oreSites,
      percentage: toPercent(b.oreSites, totalOreSites),
    }))
  }
  if (groupBy === 'month') {
    const buckets = new Map<number, { count: number; oreSites: number }>()
    for (let d = 1; d <= 31; d++) buckets.set(d, { count: 0, oreSites: 0 })
    for (const a of acquisitions) {
      const d = new Date(a.timestamp * 1000).getUTCDate()
      const b = buckets.get(d)!
      b.count += 1
      b.oreSites += a.ore_sites
      buckets.set(d, b)
    }
    return Array.from({ length: 31 }, (_, i) => i + 1).map((d) => {
      const b = buckets.get(d) ?? { count: 0, oreSites: 0 }
      return {
        label: String(d),
        acquisitions: b.count,
        oreSites: b.oreSites,
        percentage: toPercent(b.oreSites, totalOreSites),
      }
    })
  }
  const buckets = Array.from({ length: 12 }, () => ({ count: 0, oreSites: 0 }))
  for (const a of acquisitions) {
    const m = new Date(a.timestamp * 1000).getUTCMonth()
    buckets[m].count += 1
    buckets[m].oreSites += a.ore_sites
  }
  return buckets.map((b, month) => ({
    label: MONTH_NAMES[month],
    acquisitions: b.count,
    oreSites: b.oreSites,
      percentage: toPercent(b.oreSites, totalOreSites),
  }))
}

interface TimeDistributionChartProps {
  acquisitions: Acquisition[]
}

export function TimeDistributionChart({ acquisitions }: TimeDistributionChartProps) {
  const available = useMemo(() => getAvailableGroupBy(acquisitions), [acquisitions])
  const [groupBy, setGroupBy] = useState<GroupBy>(() =>
    available.includes('day') ? 'day' : available[0]
  )
  const [windowOffset, setWindowOffset] = useState(0)

  const { filtered, canPrev, canNext, timeRangeLabel } = useMemo(() => {
    const result = filterAcquisitionsForSinglePeriod(acquisitions, groupBy, windowOffset)
    return {
      filtered: result.acquisitions,
      canPrev: result.canPrev,
      canNext: result.canNext,
      timeRangeLabel: result.label,
    }
  }, [acquisitions, groupBy, windowOffset])
  const chartData = useMemo(() => distributionByGroupBy(filtered, groupBy), [filtered, groupBy])

  if (acquisitions.length === 0) {
    return <p className="text-sm text-muted-foreground">No data for time distribution.</p>
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <GroupByControls
        available={available}
        groupBy={groupBy}
        timeRangeLabel={timeRangeLabel}
        canPrev={canPrev}
        canNext={canNext}
        onGroupByChange={(g) => {
          setGroupBy(g)
          setWindowOffset(0)
        }}
        onPrev={() => setWindowOffset((o) => o - 1)}
        onNext={() => setWindowOffset((o) => o + 1)}
      />

      <div className="min-h-0 flex-1 pt-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-full min-h-[200px] w-full">
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{ left: 0, right: 12 }}
            barCategoryGap="20%"
            barGap={4}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <YAxis
              dataKey="percentage"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(v) => `${v}%`}
            />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={24}
              interval="preserveStartEnd"
            />
            <ChartTooltip
              isAnimationActive={false}
              animationDuration={0}
              content={
                <ChartTooltipContent
                  labelFormatter={(value, payload) => {
                    const p = payload?.[0]?.payload as { label?: string } | undefined
                    return p?.label ?? value
                  }}
                  formatter={(value, _name, item, _index, payload) => {
                    const oreSites = (payload as { oreSites?: number })?.oreSites ?? 0
                    const indicatorColor = item.payload?.fill ?? item.color ?? 'var(--color-percentage)'
                    return (
                      <div
                        className={cn(
                          'flex w-full flex-wrap items-stretch gap-2 [&_svg]:h-2.5 [&_svg]:w-2.5 [&_svg]:text-muted-foreground',
                          'items-center'
                        )}
                      >
                        <div
                          className="shrink-0 h-2.5 w-2.5 rounded-[2px] border-(--color-border) bg-(--color-bg)"
                          style={
                            {
                              '--color-bg': indicatorColor,
                              '--color-border': indicatorColor,
                            } as React.CSSProperties
                          }
                        />
                        <div className="flex flex-1 justify-between leading-none items-center">
                          <div className="grid gap-1.5">
                            <span className="text-muted-foreground">Share</span>
                            <span className="text-muted-foreground">Ore Sites</span>
                          </div>
                          <div className="grid gap-1.5 text-right">
                            <span className="font-mono font-medium text-foreground tabular-nums">
                              {value}%
                            </span>
                            <span className="font-mono font-medium text-foreground tabular-nums">
                              {oreSites.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  }}
                />
              }
            />
            <Bar
              dataKey="percentage"
              fill="var(--color-percentage)"
              radius={4}
              animationDuration={250}
            />
          </BarChart>
        </ChartContainer>
      </div>
    </div>
  )
}
