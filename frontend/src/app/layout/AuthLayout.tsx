import { Outlet } from 'react-router-dom'
import { useTheme } from '@/shared/hooks/useTheme'
import marsBg from '@/shared/assets/mars-bg.png'

export function AuthLayout() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div
      className="relative flex min-h-svh flex-col bg-cover bg-center bg-no-repeat px-4 py-12"
      style={{ backgroundImage: `url(${marsBg})` }}
    >
      <div
        className={`absolute inset-0 ${isDark ? 'bg-mars-overlay' : 'bg-white/80'}`}
      />

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center">
        <header className="text-center">
          <h1
            className={`text-[1.75rem] font-semibold leading-tight tracking-tight sm:text-[2rem] ${isDark ? 'text-white' : 'text-neutral-900'}`}
          >
            Welcome to Mars Command Station
          </h1>
          <p
            className={`mt-2 text-xs font-medium uppercase tracking-[0.25em] ${isDark ? 'text-mars-muted' : 'text-neutral-600'}`}
          >
            Resource Monitoring and Crew Management
          </p>
        </header>

        <div className="mt-10 w-full max-w-[26rem]">
          <Outlet />
        </div>
      </div>

      <footer
        className={`relative z-10 py-4 text-center text-xs ${isDark ? 'text-mars-muted' : 'text-neutral-800'}`}
      >
        © {new Date().getFullYear()} Mars Command Station
      </footer>
    </div>
  )
}
