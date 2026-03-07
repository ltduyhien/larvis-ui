import { useState, useMemo } from 'react'
import { Bar, BarChart, CartesianGrid, ComposedChart, Line, XAxis, YAxis } from 'recharts'
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, GitCompareIcon } from 'lucide-react'
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
  groupAcquisitions,
  groupAcquisitionsCompare,
  getAvailableGroupBy,
  type GroupBy,
} from '../utils/groupAcquisitions'

const GROUP_LABELS: Record<GroupBy, string> = {
  day: 'By Day',
  week: 'By Week',
  month: 'By Month',
  year: 'By Year',
}

const chartConfig = {
  period: { label: 'Period' },
  oreSites: {
    label: 'Ore Sites',
    color: 'var(--color-mars-500)',
  },
  oreSitesCurrent: {
    label: 'Current period',
    color: 'var(--color-mars-500)',
  },
  oreSitesPrevious: {
    label: 'Previous period',
    color: 'var(--muted-foreground)',
  },
  trend: {
    label: 'Trend',
    color: 'var(--chart-2)',
  },
} satisfies ChartConfig

function linearRegression(values: number[]): number[] {
  const n = values.length
  if (n === 0) return []
  if (n === 1) return [values[0]]
  let sumX = 0,
    sumY = 0,
    sumXY = 0,
    sumX2 = 0
  for (let i = 0; i < n; i++) {
    sumX += i
    sumY += values[i]
    sumXY += i * values[i]
    sumX2 += i * i
  }
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n
  return values.map((_, i) => slope * i + intercept)
}

interface OreFindingsChartProps {
  acquisitions: Acquisition[]
  title?: string
}

export function OreFindingsChart({ acquisitions, title = 'Ore Discoveries' }: OreFindingsChartProps) {
  const available = useMemo(() => getAvailableGroupBy(acquisitions), [acquisitions])
  const [groupBy, setGroupBy] = useState<GroupBy>(() =>
    available.includes('day') ? 'day' : available[0]
  )
  const [windowOffset, setWindowOffset] = useState(0)
  const [compare, setCompare] = useState(false)

  const { data, canPrev, canNext } = useMemo(
    () => groupAcquisitions(acquisitions, groupBy, windowOffset),
    [acquisitions, groupBy, windowOffset]
  )
  const { data: compareData } = useMemo(
    () => groupAcquisitionsCompare(acquisitions, groupBy, windowOffset),
    [acquisitions, groupBy, windowOffset]
  )

  const chartData = useMemo(() => {
    const base = data.map((d) => ({ period: d.period, label: d.label, oreSites: d.oreSites }))
    const trendValues = linearRegression(base.map((d) => d.oreSites))
    return base.map((d, i) => ({ ...d, trend: Math.round(trendValues[i] * 100) / 100 }))
  }, [data])

  const timeRangeLabel =
    data.length === 0 ? '' : data.length === 1 ? data[0].label : `${data[0].label} – ${data[data.length - 1].label}`

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        <Button
          variant={compare ? 'default' : 'outline'}
          size="sm"
          className="gap-2"
          onClick={() => setCompare((c) => !c)}
        >
          <GitCompareIcon className="size-4" />
          Compare with previous period
        </Button>
      </div>
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

      {compare
        ? compareData.length === 0
          ? (
            <p className="text-sm text-muted-foreground">No data for comparison.</p>
            )
          : (
            <div className="min-h-0 flex-1 pt-6">
              <ChartContainer config={chartConfig} className="aspect-auto h-full min-h-[200px] w-full">
                <BarChart
                  accessibilityLayer
                  data={compareData}
                  margin={{ left: 0, right: 12 }}
                  barCategoryGap="20%"
                  barGap={4}
                  animationDuration={250}
                >
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <YAxis
                    dataKey="oreSitesCurrent"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    allowDecimals={false}
                    domain={[
                      0,
                      (dataMax: number) =>
                        Math.ceil(
                          Math.max(
                            dataMax,
                            ...compareData.map((d) => d.oreSitesPrevious)
                          ) * 1.05
                        ) || 1,
                    ]}
                  />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    minTickGap={24}
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
                      />
                    }
                  />
                  <Bar
                    dataKey="oreSitesPrevious"
                    fill="var(--color-oreSitesPrevious)"
                    radius={4}
                    name="Previous period"
                    animationDuration={250}
                  />
                  <Bar
                    dataKey="oreSitesCurrent"
                    fill="var(--color-oreSitesCurrent)"
                    radius={4}
                    name="Current period"
                    animationDuration={250}
                  />
                </BarChart>
              </ChartContainer>
            </div>
            )
        : chartData.length === 0
          ? (
            <p className="text-sm text-muted-foreground">No data for this range.</p>
            )
          : (
            <div className="min-h-0 flex-1 pt-6">
              <ChartContainer config={chartConfig} className="aspect-auto h-full min-h-[200px] w-full">
                <ComposedChart
                  accessibilityLayer
                  data={chartData}
                  margin={{ left: 0, right: 12 }}
                  animationDuration={250}
                >
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <YAxis
                    dataKey="oreSites"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    allowDecimals={false}
                  />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    minTickGap={24}
                  />
                  <ChartTooltip
                    isAnimationActive={false}
                    animationDuration={0}
                    content={
                      <ChartTooltipContent
                        labelFormatter={(value, payload) => {
                          const p = payload?.[0]?.payload
                          return p?.label ?? value
                        }}
                      />
                    }
                  />
                  <Bar
                    dataKey="oreSites"
                    fill="var(--color-oreSites)"
                    radius={4}
                    animationDuration={250}
                  />
                  <Line
                    type="monotone"
                    dataKey="trend"
                    stroke="var(--color-trend)"
                    strokeWidth={2}
                    dot={false}
                    connectNulls
                    animationDuration={250}
                  />
                </ComposedChart>
              </ChartContainer>
            </div>
            )}
    </div>
  )
}
