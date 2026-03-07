import { useCallback, useState } from 'react'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { getApiErrorMessage, isApiError, setAccessToken } from '@/shared/api/client'
import { getUser, login, updateProfile } from '@/shared/api/endpoints'

export interface ChangePasswordParams {
  oldPassword: string
  newPassword: string
}

export interface ChangePasswordResult {
  success: boolean
  error: string | null
}

export function useChangePassword() {
  const { userId } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const changePassword = useCallback(
    async ({ oldPassword, newPassword }: ChangePasswordParams): Promise<ChangePasswordResult> => {
      if (!userId) {
        return { success: false, error: 'Not authenticated.' }
      }

      setIsLoading(true)
      try {
        await login({ user_id: userId, password: oldPassword })

        const user = await getUser(userId)
        await updateProfile(userId, {
          name: user.name,
          password: newPassword,
        })

        const { access } = await login({ user_id: userId, password: newPassword })
        setAccessToken(access)

        return { success: true, error: null }
      } catch (err) {
        const message =
          isApiError(err) && err.status === 401
            ? 'Incorrect old password.'
            : getApiErrorMessage(err, 'Failed to change password.')
        return { success: false, error: message }
      } finally {
        setIsLoading(false)
      }
    },
    [userId]
  )

  return { changePassword, isLoading }
}
