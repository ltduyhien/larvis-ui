// endpoints.ts: Typed API functions for each LARVIS endpoint.
// Each function wraps the generic api() client with the correct path, method, and types.
// Features import from here — never from client.ts directly.

import { api } from './client'
// api: The centralized fetch wrapper that handles auth headers and error responses.

// --- Types ---

export interface TokenResponse {
  access: string
  // access: The JWT token string returned after successful authentication.
}

export interface LoginRequest {
  user_id: string
  // user_id: The username to authenticate (alice, bob, or charlie).
  password: string
  // password: The user's password (default: "1234" for all users).
}

export interface User {
  user_id: string
  // user_id: Unique identifier for the user.
  name: string
  // name: Display name of the user.
  password?: string
  // password: Only present when viewing your OWN profile.
  // The API omits this field when viewing other users' profiles.
}

export interface Acquisition {
  timestamp: number
  // timestamp: Unix timestamp (seconds since 1970-01-01) of the satellite scan.
  ore_sites: number
  // ore_sites: Number of ore deposit locations detected in this scan.
  // NOTE: The API docs say "sites" but the actual response uses "ore_sites".
}

export interface UpdateProfileRequest {
  name: string
  // name: The new display name.
  password: string
  // password: The new password.
}

// --- API Functions ---

export function login(credentials: LoginRequest): Promise<TokenResponse> {
  // login: POST /token — authenticate and receive a JWT.
  // No auth header needed (this is the endpoint that gives you the token).
  return api<TokenResponse>('/token', {
    method: 'POST',
    body: JSON.stringify(credentials),
    // JSON.stringify: Serialize the credentials object into a JSON string for the request body.
  })
}

export function getUsers(): Promise<User[]> {
  // getUsers: GET /users — fetch the list of all crew members.
  // Returns array of { user_id, name } (no passwords).
  return api<User[]>('/users')
}

export function getUser(userId: string): Promise<User> {
  // getUser: GET /users/:id — fetch a specific user's profile.
  // Returns { user_id, name, password? } — password only if it's YOUR profile.
  return api<User>(`/users/${userId}`)
}

export function updateProfile(userId: string, data: UpdateProfileRequest): Promise<User> {
  // updateProfile: POST /users/:id — update your own profile.
  // Only works if the JWT belongs to the same user as :id.
  // Returns the updated { user_id, name, password }.
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
