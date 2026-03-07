const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'
let accessToken: string | null = null

export function setAccessToken(token: string | null) {
  accessToken = token
}

export function getAccessToken(): string | null {
  return accessToken
}

export interface ApiError {
  message: string
  status: number
}

export function isApiError(e: unknown): e is ApiError {
  return (
    typeof e === 'object' &&
    e !== null &&
    'message' in e &&
    typeof (e as ApiError).message === 'string' &&
    'status' in e &&
    typeof (e as ApiError).status === 'number'
  )
}

export function getApiErrorMessage(e: unknown, fallback = 'Request failed'): string {
  if (isApiError(e)) return e.message
  if (e instanceof Error) return e.message
  return fallback
}

export async function api<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers as Record<string, string>,
  }

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const message = await response.text().catch(() => 'Request failed')
    if (response.status === 401) {
      accessToken = null
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth:unauthorized'))
      }
    }
    const error: ApiError = { message, status: response.status }
    throw error
  }

  return response.json() as Promise<T>
}
