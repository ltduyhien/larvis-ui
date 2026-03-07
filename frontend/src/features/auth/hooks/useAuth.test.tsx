import { createElement, type ReactNode } from 'react'
import { renderHook } from '@testing-library/react'
import { AuthContext } from '../../../app/providers/AuthContext'
import { useAuth } from './useAuth'

const wrapper =
  (value: { isAuthenticated: boolean; userId: string | null; login: jest.Mock; logout: jest.Mock; loginAt: number | null }) =>
  ({ children }: { children: ReactNode }) =>
    createElement(AuthContext.Provider, { value }, children)

const mockValue = {
  isAuthenticated: false,
  userId: null as string | null,
  login: jest.fn(),
  logout: jest.fn(),
  loginAt: null as number | null,
}

describe('useAuth', () => {
  it('throws when used outside AuthProvider', () => {
    expect(() => renderHook(() => useAuth())).toThrow(
      'useAuth must be used within an AuthProvider'
    )
  })

  it('returns auth context when inside AuthProvider', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: wrapper(mockValue),
    })
    expect(result.current).toHaveProperty('isAuthenticated', false)
    expect(result.current).toHaveProperty('userId', null)
    expect(result.current).toHaveProperty('login')
    expect(result.current).toHaveProperty('logout')
  })
})
