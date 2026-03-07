import { useEffect, useRef, useState, useCallback } from 'react'
import { getAcquisitions, type Acquisition } from '@/shared/api/endpoints'

const POLL_INTERVAL_MS = 30_000

function fingerprint(data: Acquisition[]): string {
  return JSON.stringify(
    data.map((a) => `${a.timestamp}:${a.ore_sites}`)
  )
}

export function useAcquisitionsPolling() {
  const [acquisitions, setAcquisitions] = useState<Acquisition[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [hasNewData, setHasNewData] = useState(false)
  const [connectedSince, setConnectedSince] = useState<number | null>(null)
  const lastFingerprint = useRef<string | null>(null)

  const fetchAcquisitions = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true)
    try {
      setError(null)
      const data = await getAcquisitions()
      setConnectedSince((prev) => prev ?? Date.now())
      const fp = fingerprint(data)

      if (lastFingerprint.current !== null && lastFingerprint.current !== fp) {
        setHasNewData(true)
      }
      lastFingerprint.current = fp
      setAcquisitions(data)
    } catch (e) {
      const err = e as { message?: string; status?: number }
      const message = typeof err?.message === 'string' ? err.message : (e instanceof Error ? e.message : String(e))
      setError(new Error(message))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAcquisitions(true)
  }, [fetchAcquisitions])

  useEffect(() => {
    const id = setInterval(() => fetchAcquisitions(false), POLL_INTERVAL_MS)
    return () => clearInterval(id)
  }, [fetchAcquisitions])

  const dismissNewData = useCallback(() => setHasNewData(false), [])

  const refresh = useCallback(() => {
    setHasNewData(false)
    return fetchAcquisitions(false)
  }, [fetchAcquisitions])

  return {
    acquisitions,
    isLoading,
    error,
    hasNewData,
    connectedSince,
    dismissNewData,
    refresh,
  }
}
