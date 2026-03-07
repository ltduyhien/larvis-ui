import { act, renderHook } from '@testing-library/react'
import { useChangePassword } from './useChangePassword'

let mockUserId: string | null = 'alice'
jest.mock('@/features/auth/hooks/useAuth', () => ({
  useAuth: () => ({ userId: mockUserId }),
}))

const mockLogin = jest.fn()
const mockGetUser = jest.fn()
const mockUpdateProfile = jest.fn()
const mockSetAccessToken = jest.fn()

jest.mock('@/shared/api/endpoints', () => ({
  login: (...args: unknown[]) => mockLogin(...args),
  getUser: (...args: unknown[]) => mockGetUser(...args),
  updateProfile: (...args: unknown[]) => mockUpdateProfile(...args),
}))

jest.mock('@/shared/api/client', () => ({
  setAccessToken: (...args: unknown[]) => mockSetAccessToken(...args),
  getApiErrorMessage: (e: unknown) => (e as Error).message,
  isApiError: (e: unknown) => typeof e === 'object' && e !== null && 'status' in e,
}))

describe('useChangePassword', () => {
  beforeEach(() => {
    mockUserId = 'alice'
    jest.clearAllMocks()
    mockGetUser.mockResolvedValue({ user_id: 'alice', name: 'Alice' })
  })

  it('returns success when all API calls succeed', async () => {
    mockLogin.mockResolvedValue({ access: 'token' })
    mockUpdateProfile.mockResolvedValue({})

    const { result } = renderHook(() => useChangePassword())

    let changeResult: { success: boolean; error: string | null } | undefined
    await act(async () => {
      changeResult = await result.current.changePassword({
        oldPassword: 'old',
        newPassword: 'new',
      })
    })

    expect(changeResult?.success).toBe(true)
    expect(changeResult?.error).toBeNull()
    expect(mockLogin).toHaveBeenCalledWith({ user_id: 'alice', password: 'old' })
    expect(mockLogin).toHaveBeenCalledWith({ user_id: 'alice', password: 'new' })
    expect(mockSetAccessToken).toHaveBeenCalledWith('token')
  })

  it('returns Incorrect old password when login returns 401', async () => {
    mockLogin.mockRejectedValue({ status: 401, message: 'Unauthorized' })

    const { result } = renderHook(() => useChangePassword())

    let changeResult: { success: boolean; error: string | null } | undefined
    await act(async () => {
      changeResult = await result.current.changePassword({
        oldPassword: 'wrong',
        newPassword: 'new',
      })
    })

    expect(changeResult?.success).toBe(false)
    expect(changeResult?.error).toBe('Incorrect old password.')
  })

  it('returns generic error on other API failures', async () => {
    mockLogin.mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => useChangePassword())

    let changeResult: { success: boolean; error: string | null } | undefined
    await act(async () => {
      changeResult = await result.current.changePassword({
        oldPassword: 'old',
        newPassword: 'new',
      })
    })

    expect(changeResult?.success).toBe(false)
    expect(changeResult?.error).toBe('Network error')
  })

  it('returns Not authenticated when userId is null', async () => {
    mockUserId = null
    const { result } = renderHook(() => useChangePassword())

    let changeResult: { success: boolean; error: string | null } | undefined
    await act(async () => {
      changeResult = await result.current.changePassword({
        oldPassword: 'old',
        newPassword: 'new',
      })
    })

    expect(changeResult?.success).toBe(false)
    expect(changeResult?.error).toBe('Not authenticated.')
    expect(mockLogin).not.toHaveBeenCalled()
  })
})
