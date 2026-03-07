import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '@/shared/hooks/useTheme'
import { useAuth } from '../hooks/useAuth'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card'

const ERROR_FIELDS_REQUIRED = 'Please fill out all fields.'
const ERROR_USERNAME_REQUIRED = 'Please fill out username.'
const ERROR_PASSWORD_REQUIRED = 'Please fill out password.'
const ERROR_INVALID_CREDENTIALS =
  'Invalid credentials. Please check your username and password.'

export function LoginForm() {
  const [userId, setUserId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { theme } = useTheme()
  const { login } = useAuth()
  const navigate = useNavigate()
  const isDark = theme === 'dark'

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    if (!userId.trim() && !password.trim()) {
      setError(ERROR_FIELDS_REQUIRED)
      return
    }
    if (!password.trim()) {
      setError(ERROR_PASSWORD_REQUIRED)
      return
    }
    if (!userId.trim()) {
      setError(ERROR_USERNAME_REQUIRED)
      return
    }

    setIsLoading(true)
    try {
      await login(userId, password)
      navigate('/activities', { replace: true })
    } catch {
      setError(ERROR_INVALID_CREDENTIALS)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card
      className={`gap-0 border p-10 shadow-none outline-none ring-0 backdrop-blur-[2px] ${
        isDark
          ? 'border-mars-border bg-mars-overlay'
          : 'border-background bg-background'
      }`}
    >
      <CardHeader className="gap-1 p-0">
        <CardTitle
          className={`text-xl ${isDark ? 'text-white' : 'text-neutral-900'}`}
        >
          Secure terminal access
        </CardTitle>
        <CardDescription
          className={`text-[0.8125rem] ${isDark ? 'text-mars-muted' : 'text-neutral-600'}`}
        >
          Enter your credentials to access the terminal
        </CardDescription>
      </CardHeader>

      <CardContent className="mt-6 p-0">
        <form onSubmit={handleSubmit} noValidate>
          <div
            className="space-y-5"
            data-invalid={error ? true : undefined}
          >
            <div className="space-y-2">
              <Label
                htmlFor="userId"
                className={`text-sm font-medium ${
                  error &&
                  (error === ERROR_FIELDS_REQUIRED ||
                    error === ERROR_USERNAME_REQUIRED ||
                    error === ERROR_INVALID_CREDENTIALS)
                    ? 'text-mars-error'
                    : isDark
                      ? 'text-mars-muted'
                      : 'text-neutral-600'
                }`}
              >
                Username
              </Label>
              <Input
                id="userId"
                type="text"
                variant="glass"
                autoComplete="username"
                placeholder="Enter your username"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                disabled={isLoading}
                required
                aria-invalid={!!(error && (error === ERROR_FIELDS_REQUIRED || error === ERROR_USERNAME_REQUIRED || error === ERROR_INVALID_CREDENTIALS))}
                aria-describedby={error && (error === ERROR_FIELDS_REQUIRED || error === ERROR_USERNAME_REQUIRED || error === ERROR_INVALID_CREDENTIALS) ? 'login-error' : undefined}
                className={`rounded-sm ${!isDark ? 'border-neutral-300 bg-white/95 text-neutral-900 placeholder:text-neutral-500 caret-neutral-900' : ''}`}
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="password"
                className={`text-sm font-medium ${error ? 'text-mars-error' : isDark ? 'text-mars-muted' : 'text-neutral-600'}`}
              >
                Password
              </Label>
              <Input
                id="password"
                type="password"
                variant="glass"
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
                aria-invalid={!!error}
                aria-describedby={error ? 'login-error' : undefined}
                className={`rounded-sm ${!isDark ? 'border-neutral-300 bg-white/95 text-neutral-900 placeholder:text-neutral-500 caret-neutral-900' : ''}`}
              />
              {error && (
                <p
                  id="login-error"
                  role="alert"
                  className="text-sm text-mars-error"
                >
                  {error}
                </p>
              )}
            </div>
          </div>

          <Button
            type="submit"
            variant="mars"
            className="mt-6 h-10 w-full cursor-pointer rounded-sm text-sm font-medium disabled:opacity-100"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="inline-flex size-5 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden />
                Signing in
              </>
            ) : (
              'Sign in'
            )}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="mt-6 p-0">
        <p
          className={`text-xs leading-normal ${isDark ? 'text-mars-muted' : 'text-neutral-600'}`}
        >
          By accessing this terminal, you agree to the Station Operations Protocol.
        </p>
      </CardFooter>
    </Card>
  )
}
