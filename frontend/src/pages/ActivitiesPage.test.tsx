import { render, screen, fireEvent } from '@testing-library/react'
import { ActivitiesPage } from './ActivitiesPage'

jest.mock('@/features/acquisitions/components/OreFindingsChart', () => ({
  OreFindingsChart: () => <div data-testid="ore-chart" />,
}))
jest.mock('@/features/acquisitions/components/TimeDistributionChart', () => ({
  TimeDistributionChart: () => <div data-testid="time-chart" />,
}))

const mockAcquisitions = jest.fn()
const mockIsLoading = jest.fn()
const mockError = jest.fn()
const mockHasNewData = jest.fn()
const mockDismissNewData = jest.fn()
const mockRefresh = jest.fn()
const mockConnectedSince = jest.fn()

jest.mock('@/features/acquisitions/hooks/useAcquisitionsPolling', () => ({
  useAcquisitionsPolling: () => ({
    acquisitions: mockAcquisitions(),
    isLoading: mockIsLoading(),
    error: mockError(),
    hasNewData: mockHasNewData(),
    connectedSince: mockConnectedSince(),
    dismissNewData: mockDismissNewData,
    refresh: mockRefresh,
  }),
}))

describe('ActivitiesPage', () => {
  beforeEach(() => {
    mockAcquisitions.mockReturnValue([])
    mockIsLoading.mockReturnValue(false)
    mockError.mockReturnValue(null)
    mockHasNewData.mockReturnValue(false)
    mockConnectedSince.mockReturnValue(Date.now())
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('renders error state with Retry button', () => {
    mockError.mockReturnValue(new Error('Network failed'))
    mockAcquisitions.mockReturnValue([])

    render(<ActivitiesPage />)

    expect(screen.getByText(/Failed to load: Network failed/)).toBeTruthy()
    expect(screen.getByRole('button', { name: /Retry/i })).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: /Retry/i }))
    expect(mockRefresh).toHaveBeenCalled()
  })

  it('renders loading state when loading and no data', () => {
    mockIsLoading.mockReturnValue(true)
    mockAcquisitions.mockReturnValue([])

    render(<ActivitiesPage />)

    expect(screen.getByText(/Loading ore acquisition data/)).toBeTruthy()
  })

  it('renders main content when data loaded', () => {
    mockAcquisitions.mockReturnValue([
      { timestamp: 1000, ore_sites: 5 },
      { timestamp: 2000, ore_sites: 3 },
    ])

    render(<ActivitiesPage />)

    expect(screen.getByText('Activities')).toBeTruthy()
    expect(screen.getByText('Total Ore Sites')).toBeTruthy()
    expect(screen.getByText('8')).toBeTruthy()
  })

  it('shows new data banner when hasNewData is true', () => {
    mockHasNewData.mockReturnValue(true)

    render(<ActivitiesPage />)

    expect(screen.getByText(/New ore findings detected/)).toBeTruthy()
    expect(screen.getByRole('button', { name: /Dismiss/i })).toBeTruthy()
    expect(screen.getByRole('button', { name: /Refresh/i })).toBeTruthy()
  })

  it('calls dismissNewData when Dismiss clicked', () => {
    mockHasNewData.mockReturnValue(true)

    render(<ActivitiesPage />)
    fireEvent.click(screen.getByRole('button', { name: /Dismiss/i }))

    expect(mockDismissNewData).toHaveBeenCalled()
  })

  it('calls refresh when Refresh clicked in new data banner', () => {
    mockHasNewData.mockReturnValue(true)

    render(<ActivitiesPage />)
    fireEvent.click(screen.getByRole('button', { name: /Refresh/i }))

    expect(mockRefresh).toHaveBeenCalled()
  })
})
