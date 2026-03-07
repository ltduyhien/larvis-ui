import { useState, useCallback, useEffect } from 'react'
import type { ReactNode } from 'react'
import type { AuthContextType } from '@/features/auth/types'
import { login as loginApi } from '@/shared/api/endpoints'
import { setAccessToken } from '@/shared/api/client'
import { AuthContext } from './AuthContext'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null)
  const [loginAt, setLoginAt] = useState<number | null>(null)

  const login = useCallback(async (id: string, password: string) => {
    const response = await loginApi({ user_id: id, password })
    setAccessToken(response.access)
    setUserId(id)
    setLoginAt(Date.now())
  }, [])

  const logout = useCallback(() => {
    setAccessToken(null)
    setUserId(null)
    setLoginAt(null)
  }, [])

  useEffect(() => {
    const handleUnauthorized = () => {
      setUserId(null)
      setLoginAt(null)
    }
    window.addEventListener('auth:unauthorized', handleUnauthorized)
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized)
  }, [])

  const value: AuthContextType = {
    isAuthenticated: userId !== null,
    userId,
    loginAt,
    login,
    logout,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
