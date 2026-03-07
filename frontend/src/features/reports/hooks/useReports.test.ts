import { renderHook, act } from '@testing-library/react'
import { useReports } from './useReports'

const mockStorage: Record<string, string> = {}
const localStorageMock = {
  getItem: jest.fn((key: string) => mockStorage[key] ?? null),
  setItem: jest.fn((key: string, value: string) => {
    mockStorage[key] = value
  }),
  clear: jest.fn(() => {
    Object.keys(mockStorage).forEach((k) => delete mockStorage[k])
  }),
}
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock })

describe('useReports', () => {
  beforeEach(() => {
    localStorageMock.clear()
    jest.clearAllMocks()
  })

  it('returns reports and updateReport', () => {
    const { result } = renderHook(() => useReports())
    expect(result.current).toHaveProperty('reports')
    expect(typeof result.current.reports).toBe('object')
    expect(result.current).toHaveProperty('updateReport')
  })

  it('updateReport merges new report', () => {
    const { result } = renderHook(() => useReports())
    act(() => {
      result.current.updateReport('2025-0', { notes: 'Test', fileNames: [] })
    })
    expect(result.current.reports['2025-0']).toEqual({ notes: 'Test', fileNames: [] })
  })
})
