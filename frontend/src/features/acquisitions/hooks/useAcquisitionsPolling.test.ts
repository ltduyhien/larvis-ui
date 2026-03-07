import { act, renderHook, waitFor } from '@testing-library/react'
import { useAcquisitionsPolling } from './useAcquisitionsPolling'

const mockGetAcquisitions = jest.fn()
jest.mock('@/shared/api/endpoints', () => ({
  getAcquisitions: (...args: unknown[]) => mockGetAcquisitions(...args),
}))
jest.mock('@/shared/api/client', () => ({
  getApiErrorMessage: (e: unknown) => (e as Error).message,
}))

describe('useAcquisitionsPolling', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
    mockGetAcquisitions.mockResolvedValue([])
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('fetches on mount and returns data', async () => {
    const data = [{ timestamp: 1000, ore_sites: 5 }]
    mockGetAcquisitions.mockResolvedValue(data)

    const { result } = renderHook(() => useAcquisitionsPolling())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.acquisitions).toEqual(data)
  })

  it('does not update state after unmount', async () => {
    mockGetAcquisitions.mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve([{ timestamp: 1, ore_sites: 1 }]), 100)
        })
    )

    const { unmount } = renderHook(() => useAcquisitionsPolling())

    unmount()
    act(() => {
      jest.advanceTimersByTime(150)
    })

    expect(mockGetAcquisitions).toHaveBeenCalled()
  })

  it('sets error when fetch fails', async () => {
    mockGetAcquisitions.mockRejectedValue(new Error('Network failed'))

    const { result } = renderHook(() => useAcquisitionsPolling())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).not.toBeNull()
    })

    expect(result.current.error?.message).toBe('Network failed')
  })

  it('sets hasNewData when data changes', async () => {
    mockGetAcquisitions
      .mockResolvedValueOnce([{ timestamp: 1, ore_sites: 1 }])
      .mockResolvedValueOnce([{ timestamp: 1, ore_sites: 1 }, { timestamp: 2, ore_sites: 2 }])

    const { result } = renderHook(() => useAcquisitionsPolling())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => {
      jest.advanceTimersByTime(30000)
    })

    await waitFor(() => {
      expect(result.current.hasNewData).toBe(true)
    })
  })
})
