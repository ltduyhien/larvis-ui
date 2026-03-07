import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'

interface LayoutContextValue {
  isMobile: boolean
  isSidebarOpen: boolean
  openSidebar: () => void
  closeSidebar: () => void
}

const LayoutContext = createContext<LayoutContextValue | null>(null)

const MOBILE_BREAKPOINT = 768

function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const handleChange = () => setIsMobile(mq.matches)
    handleChange()
    mq.addEventListener('change', handleChange)
    return () => mq.removeEventListener('change', handleChange)
  }, [])

  return isMobile
}

export function LayoutProvider({ children }: { children: ReactNode }) {
  const isMobile = useIsMobile()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const openSidebar = useCallback(() => setIsSidebarOpen(true), [])
  const closeSidebar = useCallback(() => setIsSidebarOpen(false), [])

  useEffect(() => {
    if (!isMobile) setIsSidebarOpen(false)
  }, [isMobile])

  const value: LayoutContextValue = {
    isMobile,
    isSidebarOpen,
    openSidebar,
    closeSidebar,
  }

  return (
    <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>
  )
}

export function useLayout() {
  const ctx = useContext(LayoutContext)
  return ctx
}
