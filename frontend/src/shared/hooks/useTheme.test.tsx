import { renderHook } from '@testing-library/react'
import { ThemeProvider } from '@/app/providers/ThemeProvider'
import { useTheme } from './useTheme'

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>{children}</ThemeProvider>
)

describe('useTheme', () => {
  it('throws when used outside ThemeProvider', () => {
    expect(() => renderHook(() => useTheme())).toThrow(
      'useTheme must be used within ThemeProvider'
    )
  })

  it('returns theme and toggleTheme when inside ThemeProvider', () => {
    const { result } = renderHook(() => useTheme(), { wrapper })
    expect(result.current).toHaveProperty('theme')
    expect(['dark', 'light']).toContain(result.current.theme)
    expect(result.current).toHaveProperty('toggleTheme')
    expect(typeof result.current.toggleTheme).toBe('function')
  })
})
