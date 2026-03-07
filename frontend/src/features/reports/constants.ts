export const REPORTS_STORAGE_KEY = 'larvis-reports'

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
] as const

export const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf'] as const
export const ACCEPT_ATTR = '.jpg,.jpeg,.png,.gif,.webp,.pdf'

export interface SavedReport {
  notes: string
  fileNames: string[]
}

export const DUMMY_REPORTS: Record<string, SavedReport> = {
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
}
