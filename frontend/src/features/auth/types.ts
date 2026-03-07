export interface AuthContextType {
  isAuthenticated: boolean
  userId: string | null
  loginAt: number | null
  login: (userId: string, password: string) => Promise<void>
  logout: () => void
}
