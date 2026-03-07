jest.mock('@/shared/api/api-config', () => ({ getApiBaseUrl: () => '/api' }))

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '@/app/providers/AuthProvider'
import { ThemeProvider } from '@/app/providers/ThemeProvider'
import { LoginForm } from './LoginForm'

const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))

const mockLogin = jest.fn()
jest.mock('@/shared/api/endpoints', () => ({
  login: (...args: unknown[]) => mockLogin(...args),
}))

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <ThemeProvider>
      <AuthProvider>{children}</AuthProvider>
    </ThemeProvider>
  </BrowserRouter>
)

describe('LoginForm (integration)', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
    mockLogin.mockReset()
  })

  it('navigates to /activities on successful login', async () => {
    mockLogin.mockResolvedValue({ access: 'token' })

    render(<LoginForm />, { wrapper })

    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'alice' } })
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: '1234' } })
    fireEvent.click(screen.getByRole('button', { name: /Sign in/i }))

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({ user_id: 'alice', password: '1234' })
    })

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/activities', { replace: true })
    })
  })

  it('shows error on failed login', async () => {
    mockLogin.mockRejectedValue(new Error('Invalid credentials'))

    render(<LoginForm />, { wrapper })

    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'alice' } })
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'wrong' } })
    fireEvent.click(screen.getByRole('button', { name: /Sign in/i }))

    expect(await screen.findByText('Invalid credentials. Please check your username and password.')).toBeTruthy()
    expect(mockNavigate).not.toHaveBeenCalled()
  })
})
