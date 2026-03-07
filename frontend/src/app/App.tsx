import { RouterProvider } from 'react-router-dom'
import { AuthProvider } from './providers/AuthProvider'
import { ThemeProvider } from './providers/ThemeProvider'
import { ThemeSwitch } from '@/shared/ui/theme-switch'
import { router } from './router'

export function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <RouterProvider router={router} />
        <ThemeSwitch />
      </ThemeProvider>
    </AuthProvider>
  )
}
