import { api } from './client'

export interface TokenResponse {
  access: string
}

export interface LoginRequest {
  user_id: string
  password: string
}

export interface User {
  user_id: string
  name: string
  password?: string
}

export interface Acquisition {
  timestamp: number
  ore_sites: number
}

export interface UpdateProfileRequest {
  name: string
  password: string
}

export function login(credentials: LoginRequest): Promise<TokenResponse> {
  return api<TokenResponse>('/token', {
    method: 'POST',
    body: JSON.stringify(credentials),
  })
}

export function getUsers(): Promise<User[]> {
  return api<User[]>('/users')
}

export function getUser(userId: string): Promise<User> {
  return api<User>(`/users/${userId}`)
}

export function updateProfile(userId: string, data: UpdateProfileRequest): Promise<User> {
  return api<User>(`/users/${userId}`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function getAcquisitions(): Promise<Acquisition[]> {
  const raw = await api<Array<{ timestamp: number; ore_sites?: number; sites?: number }>>('/acquisitions')
  if (!Array.isArray(raw)) return []
  return raw.map((item) => ({
    timestamp: item.timestamp,
    ore_sites: item.ore_sites ?? item.sites ?? 0,
  }))
}
