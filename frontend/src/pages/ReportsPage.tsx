import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CheckIcon, Circle, FileUpIcon, XIcon } from 'lucide-react'
import { useAcquisitionsPolling } from '@/features/acquisitions/hooks/useAcquisitionsPolling'
import {
  formatUptime,
  totalOreSitesForMonth,
  totalScansForMonth,
  uniqueDaysForMonth,
  avgOreSitesPerScanForMonth,
} from '@/features/acquisitions/utils/format'
import { Button } from '@/shared/ui/button'
import { cn } from '@/shared/utils/cn'

const REPORTS_STORAGE_KEY = 'larvis-reports'

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf'] as const
const ACCEPT_ATTR = '.jpg,.jpeg,.png,.gif,.webp,.pdf'

interface SavedReport {
  notes: string
  fileNames: string[]
}

// All months except the 2 most recent (descending order) have reports
const DUMMY_REPORTS: Record<string, SavedReport> = {
  '2025-0': {
    notes: 'Baseline established for new fiscal year. Initial sector mapping underway.',
    fileNames: ['jan-2025-baseline.pdf'],
  },
  '2025-1': {
    notes: 'Continued sector expansion. Minor dust interference in western zones.',
    fileNames: ['feb-sector-expansion.pdf'],
  },
  '2025-2': { notes: 'Spring thaw revealed new surface formations. Scan calibration updated.', fileNames: ['mar-surface.pdf'] },
  '2025-3': { notes: 'Routine operations. No anomalies.', fileNames: ['apr-routine.pdf'] },
  '2025-4': { notes: 'Peak discovery period. Sector 3 yielded high-grade samples.', fileNames: ['may-sector3.pdf'] },
  '2025-5': { notes: 'Mid-year review completed. On track for annual targets.', fileNames: ['jun-review.pdf'] },
  '2025-6': { notes: 'Dust season impact. Reduced scan frequency per protocol.', fileNames: ['jul-dust-protocol.pdf'] },
  '2025-7': { notes: 'Recovery phase. Full ops resumed.', fileNames: ['aug-recovery.pdf'] },
  '2025-8': { notes: 'Q3 wrap-up. Strong quarter overall.', fileNames: ['sep-q3.pdf'] },
  '2025-9': {
    notes: 'Strong ore discovery activity in sector 7. Recommended increasing scan frequency for Q4.',
    fileNames: ['sector7-scan.pdf', 'ore-samples-oct.jpg'],
  },
  '2025-10': {
    notes: 'Routine monthly report. No anomalies detected. Satellite performance nominal.',
    fileNames: ['monthly-summary-nov.pdf'],
  },
  '2025-11': {
    notes: 'Year-end report. Total annual ore discoveries exceeded projections by 12%.',
    fileNames: ['annual-summary-2025.pdf', 'year-end-charts.pdf'],
  },
  '2026-0': {
    notes: 'New year baseline established. Calibration sweep completed successfully.',
    fileNames: ['jan-calibration.pdf'],
  },
  // 2026-1 (Feb) and 2026-2 (Mar) intentionally unreported
}

function loadReports(): Record<string, SavedReport> {
  try {
    const raw = localStorage.getItem(REPORTS_STORAGE_KEY)
    const saved = raw ? JSON.parse(raw) : {}
    return { ...DUMMY_REPORTS, ...saved }
  } catch {
    return { ...DUMMY_REPORTS }
  }
}

function saveReports(reports: Record<string, SavedReport>) {
  localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(reports))
}

function isAllowedFile(file: File): boolean {
  const ext = file.name.split('.').pop()?.toLowerCase()
  return Boolean(ext && ALLOWED_EXTENSIONS.includes(ext as (typeof ALLOWED_EXTENSIONS)[number]))
}

function getFileIcon(ext: string): string {
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return '🖼'
  return '📄'
}

function getAvailableMonths(acquisitions: { timestamp: number }[]): { year: number; month: number }[] {
  const now = new Date()
  const currentY = now.getUTCFullYear()
  const currentM = now.getUTCMonth()

  let startY = currentY
  let startM = 0
  let endY = currentY
  let endM = currentM

  if (acquisitions.length) {
    const minTs = Math.min(...acquisitions.map((a) => a.timestamp))
    const maxTs = Math.max(...acquisitions.map((a) => a.timestamp))
    const min = new Date(minTs * 1000)
    const max = new Date(maxTs * 1000)
    startY = min.getUTCFullYear()
    startM = min.getUTCMonth()
    endY = max.getUTCFullYear()
    endM = max.getUTCMonth()
  }

  const minStartY = currentY - 1
  const minStartM = 0
  if (startY > minStartY || (startY === minStartY && startM > minStartM)) {
    startY = minStartY
    startM = minStartM
  }
  if (endY < currentY || (endY === currentY && endM < currentM)) {
    endY = currentY
    endM = currentM
  }
  // List starts from November 2025
  const listStartY = 2025
  const listStartM = 10
  if (startY < listStartY || (startY === listStartY && startM < listStartM)) {
    startY = listStartY
    startM = listStartM
  }

  const months: { year: number; month: number }[] = []
  let y = startY
  let m = startM
  while (y < endY || (y === endY && m <= endM)) {
    months.push({ year: y, month: m })
    m += 1
    if (m > 11) {
      m = 0
      y += 1
    }
  }
  return months.length ? months : [{ year: currentY, month: currentM }]
}

function monthKey(year: number, month: number): string {
  return `${year}-${month}`
}

interface StatsBlockProps {
  monthLabel: string
  reportUptime: string
  acquisitions: { timestamp: number; ore_sites: number }[]
  selected: { year: number; month: number }
  isLoading: boolean
}

function StatsBlock({ monthLabel, reportUptime, acquisitions, selected, isLoading }: StatsBlockProps) {
  return (
    <section className="rounded-lg border border-input bg-muted/30 p-6">
      <h2 className="mb-4 text-base font-semibold">Statistics for {monthLabel}</h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
        <div>
          <p className="text-sm text-muted-foreground">Satellite Total Uptime</p>
          <p className="text-lg font-semibold text-sky-500 dark:text-[oklch(0.72_0.12_230)]">
            {reportUptime}
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Total Ore Sites</p>
          <p className="text-lg font-semibold text-mars-500">
            {isLoading ? '…' : totalOreSitesForMonth(acquisitions, selected.year, selected.month)}
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Total Scans</p>
          <p className="text-lg font-semibold text-foreground">
            {isLoading ? '…' : totalScansForMonth(acquisitions, selected.year, selected.month)}
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Days with Activity</p>
          <p className="text-lg font-semibold text-foreground">
            {isLoading ? '…' : uniqueDaysForMonth(acquisitions, selected.year, selected.month)}
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Avg Ore Sites / Scan</p>
          <p className="text-lg font-semibold text-foreground">
            {isLoading ? '…' : avgOreSitesPerScanForMonth(acquisitions, selected.year, selected.month)}
          </p>
        </div>
      </div>
    </section>
  )
}

export function ReportsPage() {
  const { acquisitions, isLoading, error } = useAcquisitionsPolling()
  const [reports, setReports] = useState<Record<string, SavedReport>>(loadReports)
  const [customReport, setCustomReport] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [rejectReason, setRejectReason] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const availableMonths = useMemo(() => getAvailableMonths(acquisitions), [acquisitions])
  const now = new Date()
  const [selected, setSelected] = useState<{ year: number; month: number }>(() => ({
    year: now.getUTCFullYear(),
    month: now.getUTCMonth(),
  }))

  useEffect(() => {
    saveReports(reports)
  }, [reports])

  const monthLabel = `${MONTH_NAMES[selected.month]} ${selected.year}`
  const selectedKey = monthKey(selected.year, selected.month)
  const isReported = Boolean(reports[selectedKey])
  const savedReport = reports[selectedKey]

  const daysWithActivity = uniqueDaysForMonth(acquisitions, selected.year, selected.month)
  const reportUptime = isLoading ? '…' : formatUptime(daysWithActivity * 86400 * 1000)

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setRejectReason(null)
    const chosen = Array.from(e.target.files ?? [])
    const allowed: File[] = []
    const rejected: string[] = []
    chosen.forEach((f) => {
      if (isAllowedFile(f)) {
        allowed.push(f)
      } else {
        rejected.push(f.name)
      }
    })
    if (rejected.length) {
      setRejectReason(
        `Rejected (unsupported): ${rejected.join(', ')}. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`
      )
    }
    setFiles((prev) => [...prev, ...allowed])
    e.target.value = ''
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setRejectReason(null)
    const chosen = Array.from(e.dataTransfer.files)
    const allowed: File[] = []
    const rejected: string[] = []
    chosen.forEach((f) => {
      if (isAllowedFile(f)) {
        allowed.push(f)
      } else {
        rejected.push(f.name)
      }
    })
    if (rejected.length) {
      setRejectReason(
        `Rejected (unsupported): ${rejected.join(', ')}. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`
      )
    }
    setFiles((prev) => [...prev, ...allowed])
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const handleSend = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      setReports((prev) => ({
        ...prev,
        [selectedKey]: {
          notes: customReport,
          fileNames: files.map((f) => f.name),
        },
      }))
      setCustomReport('')
      setFiles([])
    },
    [selectedKey, customReport, files]
  )

  const handleSelectMonth = useCallback((year: number, month: number) => {
    setSelected({ year, month })
    setCustomReport('')
    setFiles([])
    setRejectReason(null)
  }, [])

  const handleResetFields = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setCustomReport('')
    setFiles([])
    setRejectReason(null)
  }, [])

  if (error) {
    return (
      <div className="flex h-full min-h-0 flex-col gap-4 pt-4">
        <div className="shrink-0 pb-6">
          <h1 className="text-2xl">
            <span className="font-bold">Reporting</span>
            <span className="font-normal text-lg"> | Monthly reports and analytics</span>
          </h1>
        </div>
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-destructive">
          Failed to load data: {error.message}
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-6 pt-4">
      <div className="shrink-0">
        <h1 className="text-2xl">
          <span className="font-bold">Reporting</span>
          <span className="font-normal text-lg"> | Monthly reports and analytics</span>
        </h1>
      </div>

      <div className="flex min-h-0 flex-1 overflow-hidden rounded-xl border border-border bg-card">
        <aside className="flex w-56 shrink-0 flex-col overflow-hidden border-r border-border bg-muted/40">
          <p className="shrink-0 p-4 pb-4 text-sm font-semibold text-foreground">Monthly Reports</p>
          <nav
            className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto px-4 pb-4"
            aria-label="Report months"
          >
            {[...availableMonths].reverse().map(({ year, month }) => {
              const key = monthKey(year, month)
              const reported = Boolean(reports[key])
              const isActive = selected.year === year && selected.month === month
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleSelectMonth(year, month)}
                  className={cn(
                    'flex w-full items-center gap-2.5 rounded-lg py-2.5 pl-3 pr-3 text-left text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                    isActive
                      ? 'border border-input bg-background text-foreground dark:border-transparent'
                      : 'border border-transparent text-muted-foreground hover:bg-background/50 hover:text-foreground'
                  )}
                >
                  {reported ? (
                    <CheckIcon className="size-4 shrink-0 text-mars-500" aria-label="Done" />
                  ) : (
                    <Circle className="size-4 shrink-0 text-muted-foreground" aria-label="Pending" />
                  )}
                  <span className="min-w-0 truncate font-medium">
                    {MONTH_NAMES[month]} {year}
                  </span>
                </button>
              )
            })}
          </nav>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <div className="min-h-0 flex-1 overflow-auto p-6">
            {isReported && savedReport ? (
              <div className="space-y-6">
                <StatsBlock
                  monthLabel={monthLabel}
                  reportUptime={reportUptime}
                  acquisitions={acquisitions}
                  selected={selected}
                  isLoading={isLoading}
                />
                <section>
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-muted-foreground">
                        Notes and observations
                      </label>
                      <div className="text-sm">
                        {savedReport.notes || (
                          <span className="text-muted-foreground">— No notes —</span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-muted-foreground">
                        Attachments
                      </label>
                      {savedReport.fileNames.length > 0 ? (
                        <ul className="space-y-1">
                          {savedReport.fileNames.map((name, i) => {
                            const ext = name.split('.').pop()?.toLowerCase() ?? ''
                            return (
                              <li key={`${name}-${i}`} className="flex items-center gap-2 text-sm">
                                <span aria-hidden>{getFileIcon(ext)}</span>
                                <span className="truncate">{name}</span>
                              </li>
                            )
                          })}
                        </ul>
                      ) : (
                        <span className="text-sm text-muted-foreground">— No attachments —</span>
                      )}
                    </div>
                  </div>
                </section>
              </div>
            ) : (
              <form id="report-form" onSubmit={handleSend} className="flex flex-col gap-6">
                <StatsBlock
                  monthLabel={monthLabel}
                  reportUptime={reportUptime}
                  acquisitions={acquisitions}
                  selected={selected}
                  isLoading={isLoading}
                />
                <section>
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <div className="flex flex-col gap-2">
                      <label htmlFor="custom-report" className="text-sm font-medium text-muted-foreground">
                        Notes and observations
                      </label>
                      <textarea
                        id="custom-report"
                        value={customReport}
                        onChange={(e) => setCustomReport(e.target.value)}
                        placeholder="Add any additional notes or observations for this report…"
                        className="min-h-[140px] w-full resize-y rounded-lg border border-input bg-muted/30 px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        rows={5}
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label id="attachments-label" className="text-sm font-medium text-muted-foreground">
                        Attachments
                      </label>
                      <div
                        role="button"
                        tabIndex={0}
                        aria-labelledby="attachments-label"
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onClick={() => inputRef.current?.click()}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            inputRef.current?.click()
                          }
                        }}
                        className={cn(
                          'flex min-h-[140px] flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-input bg-muted/30 px-4 py-6 transition-colors',
                          'hover:border-muted-foreground/40 hover:bg-muted/50',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                        )}
                      >
                        <input
                          ref={inputRef}
                          type="file"
                          accept={ACCEPT_ATTR}
                          multiple
                          className="sr-only"
                          onChange={handleFileChange}
                        />
                        <FileUpIcon className="size-8 text-muted-foreground" />
                        <p className="text-center text-sm text-muted-foreground">
                          Drop files here or click to browse
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Allowed: {ALLOWED_EXTENSIONS.join(', ')}
                        </p>
                        {files.length > 0 && (
                          <p className="text-xs font-medium text-foreground">
                            {files.length} file{files.length !== 1 ? 's' : ''} selected
                          </p>
                        )}
                      </div>
                      {rejectReason && (
                        <p className="text-xs text-destructive" role="alert">
                          {rejectReason}
                        </p>
                      )}
                      {files.length > 0 && (
                        <ul className="mt-1 space-y-1">
                          {files.map((f, i) => {
                            const ext = f.name.split('.').pop()?.toLowerCase() ?? ''
                            return (
                              <li
                                key={`${f.name}-${i}`}
                                className="flex items-center gap-2 rounded-md bg-muted/50 px-2 py-1.5 text-sm"
                              >
                                <span aria-hidden>{getFileIcon(ext)}</span>
                                <span className="min-w-0 flex-1 truncate" title={f.name}>
                                  {f.name}
                                </span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon-xs"
                                  aria-label={`Remove ${f.name}`}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    removeFile(i)
                                  }}
                                >
                                  <XIcon className="size-3" />
                                </Button>
                              </li>
                            )
                          })}
                        </ul>
                      )}
                    </div>
                  </div>
                </section>
              </form>
            )}
          </div>

          {!isReported && (
            <div className="shrink-0 border-t border-border bg-muted/30 p-6">
              <div className="flex flex-wrap items-stretch justify-between gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="default"
                  className="h-9"
                  onClick={handleResetFields}
                >
                  Reset All Fields
                </Button>
                <div className="flex items-stretch gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="default"
                    className="h-9"
                  >
                    Schedule Sending Report
                  </Button>
                  <Button type="submit" form="report-form" size="default" className="h-9">
                    Send Report
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
