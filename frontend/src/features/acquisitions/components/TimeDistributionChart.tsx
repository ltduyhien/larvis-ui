import { useState, useMemo } from 'react'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import type { Acquisition } from '@/shared/api/endpoints'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/shared/ui/chart'
import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
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

const GROUP_LABELS: Record<GroupBy, string> = {
  day: 'By Day',
  week: 'By Week',
  month: 'By Month',
  year: 'By Year',
}

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

type DistributionPoint = { label: string; acquisitions: number; percentage: number }

function distributionByGroupBy(
  acquisitions: Acquisition[],
  groupBy: GroupBy
): DistributionPoint[] {
  const total = acquisitions.length || 1
  if (groupBy === 'day') {
    const buckets = new Array<number>(24).fill(0)
    for (const a of acquisitions) {
      buckets[new Date(a.timestamp * 1000).getUTCHours()] += 1
    }
    return buckets.map((count, hour) => ({
      label: `${hour.toString().padStart(2, '0')}:00`,
      acquisitions: count,
      percentage: Math.round((count / total) * 1000) / 10,
    }))
  }
  if (groupBy === 'week') {
    const buckets = new Array<number>(7).fill(0)
    for (const a of acquisitions) {
      const day = new Date(a.timestamp * 1000).getUTCDay()
      const idx = day === 0 ? 6 : day - 1
      buckets[idx] += 1
    }
    return buckets.map((count, i) => ({
      label: DAY_NAMES[i],
      acquisitions: count,
      percentage: Math.round((count / total) * 1000) / 10,
    }))
  }
  if (groupBy === 'month') {
    const buckets = new Map<number, number>()
    for (let d = 1; d <= 31; d++) buckets.set(d, 0)
    for (const a of acquisitions) {
      const d = new Date(a.timestamp * 1000).getUTCDate()
      buckets.set(d, (buckets.get(d) ?? 0) + 1)
    }
    return Array.from({ length: 31 }, (_, i) => i + 1).map((d) => {
      const count = buckets.get(d) ?? 0
      return {
        label: String(d),
        acquisitions: count,
        percentage: Math.round((count / total) * 1000) / 10,
      }
    })
  }
  const buckets = new Array<number>(12).fill(0)
  for (const a of acquisitions) {
    buckets[new Date(a.timestamp * 1000).getUTCMonth()] += 1
  }
  return buckets.map((count, month) => ({
    label: MONTH_NAMES[month],
    acquisitions: count,
    percentage: Math.round((count / total) * 1000) / 10,
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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                {GROUP_LABELS[groupBy]}
                <ChevronDownIcon className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {available.map((g) => (
                <DropdownMenuItem key={g} onClick={() => { setGroupBy(g); setWindowOffset(0) }}>
                  {GROUP_LABELS[g]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => setWindowOffset((o) => o - 1)}
              disabled={!canPrev}
              aria-label="Previous period"
            >
              <ChevronLeftIcon className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => setWindowOffset((o) => o + 1)}
              disabled={!canNext}
              aria-label="Next period"
            >
              <ChevronRightIcon className="size-4" />
            </Button>
          </div>
        </div>
        {timeRangeLabel && (
          <p className="shrink-0 text-sm text-muted-foreground">{timeRangeLabel}</p>
        )}
      </div>

      <div className="min-h-0 flex-1 pt-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-full min-h-[200px] w-full">
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{ left: 0, right: 12 }}
            animationDuration={250}
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
                  formatter={(value) => [`${value}%`, 'Share']}
                />
              }
            />
            <Area
              type="monotone"
              dataKey="percentage"
              stroke="var(--color-percentage)"
              fill="var(--color-percentage)"
              fillOpacity={0.4}
              strokeWidth={2}
              animationDuration={250}
            />
          </AreaChart>
        </ChartContainer>
      </div>
    </div>
  )
}
