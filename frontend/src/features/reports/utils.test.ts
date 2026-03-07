import { REPORTS_STORAGE_KEY } from './constants'
import {
  isAllowedFile,
  partitionFiles,
  getFileIcon,
  monthKey,
  getAvailableMonths,
  loadReports,
  saveReports,
} from './utils'

describe('isAllowedFile', () => {
  it('returns true for allowed extensions', () => {
    expect(isAllowedFile(new File([], 'a.jpg'))).toBe(true)
    expect(isAllowedFile(new File([], 'b.jpeg'))).toBe(true)
    expect(isAllowedFile(new File([], 'c.png'))).toBe(true)
    expect(isAllowedFile(new File([], 'd.gif'))).toBe(true)
    expect(isAllowedFile(new File([], 'e.webp'))).toBe(true)
    expect(isAllowedFile(new File([], 'f.pdf'))).toBe(true)
  })

  it('returns false for disallowed extensions', () => {
    expect(isAllowedFile(new File([], 'a.txt'))).toBe(false)
    expect(isAllowedFile(new File([], 'b.exe'))).toBe(false)
    expect(isAllowedFile(new File([], 'noext'))).toBe(false)
  })

  it('returns false for double extension (takes last)', () => {
    expect(isAllowedFile(new File([], 'file.jpg.exe'))).toBe(false)
    expect(isAllowedFile(new File([], 'file.exe.jpg'))).toBe(true)
  })

  it('is case insensitive', () => {
    expect(isAllowedFile(new File([], 'a.JPG'))).toBe(true)
    expect(isAllowedFile(new File([], 'b.PDF'))).toBe(true)
  })
})

describe('partitionFiles', () => {
  it('splits allowed and rejected', () => {
    const files = [
      new File([], 'a.jpg'),
      new File([], 'b.txt'),
      new File([], 'c.pdf'),
    ]
    const { allowed, rejected } = partitionFiles(files)
    expect(allowed).toHaveLength(2)
    expect(rejected).toEqual(['b.txt'])
  })

  it('returns empty arrays for empty input', () => {
    const { allowed, rejected } = partitionFiles([])
    expect(allowed).toEqual([])
    expect(rejected).toEqual([])
  })
})

describe('getFileIcon', () => {
  it('returns image icon for image extensions', () => {
    expect(getFileIcon('jpg')).toBe('🖼')
    expect(getFileIcon('png')).toBe('🖼')
    expect(getFileIcon('webp')).toBe('🖼')
  })

  it('returns document icon for pdf', () => {
    expect(getFileIcon('pdf')).toBe('📄')
  })
})

describe('monthKey', () => {
  it('returns year-month string', () => {
    expect(monthKey(2025, 0)).toBe('2025-0')
    expect(monthKey(2026, 11)).toBe('2026-11')
  })
})

describe('loadReports', () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
      },
      writable: true,
    })
  })

  it('returns dummy reports when localStorage is empty', () => {
    ;(globalThis.localStorage.getItem as jest.Mock).mockReturnValue(null)
    const result = loadReports()
    expect(Object.keys(result).length).toBeGreaterThan(0)
  })

  it('returns merged reports when localStorage has valid data', () => {
    const saved = { '2025-0': { notes: 'Custom', fileNames: [] } }
    ;(globalThis.localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify(saved))
    const result = loadReports()
    expect(result['2025-0']).toEqual({ notes: 'Custom', fileNames: [] })
  })

  it('returns dummy reports when JSON is invalid', () => {
    ;(globalThis.localStorage.getItem as jest.Mock).mockReturnValue('invalid json')
    const result = loadReports()
    expect(Object.keys(result).length).toBeGreaterThan(0)
  })

  it('returns dummy reports when parsed value is array', () => {
    ;(globalThis.localStorage.getItem as jest.Mock).mockReturnValue('[]')
    const result = loadReports()
    expect(Object.keys(result).length).toBeGreaterThan(0)
  })

  it('skips invalid entries in parsed object', () => {
    const saved = {
      '2025-0': { notes: 'OK', fileNames: [] },
      '9999-0': { notes: 123, fileNames: [] },
      '9999-1': null,
    }
    ;(globalThis.localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify(saved))
    const result = loadReports()
    expect(result['2025-0']).toEqual({ notes: 'OK', fileNames: [] })
    expect(result['9999-0']).toBeUndefined()
    expect(result['9999-1']).toBeUndefined()
  })
})

describe('saveReports', () => {
  it('calls localStorage.setItem with JSON', () => {
    const setItem = jest.fn()
    Object.defineProperty(globalThis, 'localStorage', {
      value: { getItem: jest.fn(), setItem },
      writable: true,
    })
    saveReports({ '2025-0': { notes: 'x', fileNames: [] } })
    expect(setItem).toHaveBeenCalledWith(REPORTS_STORAGE_KEY, expect.any(String))
    expect(JSON.parse(setItem.mock.calls[0][1])['2025-0']).toEqual({ notes: 'x', fileNames: [] })
  })
})

describe('getAvailableMonths', () => {
  it('returns at least current month when no acquisitions', () => {
    const result = getAvailableMonths([])
    expect(result.length).toBeGreaterThanOrEqual(1)
    const now = new Date()
    expect(result.some((m) => m.year === now.getUTCFullYear() && m.month === now.getUTCMonth())).toBe(true)
  })

  it('includes months from acquisition range', () => {
    const jan2025 = new Date(Date.UTC(2025, 0, 15)).getTime() / 1000
    const mar2025 = new Date(Date.UTC(2025, 2, 15)).getTime() / 1000
    const result = getAvailableMonths([{ timestamp: jan2025 }, { timestamp: mar2025 }])
    expect(result.length).toBeGreaterThan(0)
  })
})
