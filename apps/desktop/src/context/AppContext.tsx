import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { helm } from '../lib/helm'
import type { HealthCheckResult } from '../lib/types'

type ToastType = 'success' | 'warning' | 'error'

export interface ToastItem {
  id: string
  title: string
  message: string
  type: ToastType
}

interface AppContextValue {
  theme: 'light' | 'dark'
  setTheme: (t: 'light' | 'dark') => void
  connection: HealthCheckResult | null
  refreshing: boolean
  refreshConnection: () => Promise<HealthCheckResult>
  settings: Record<string, string>
  reloadSettings: () => Promise<void>
  toasts: ToastItem[]
  toast: (title: string, message: string, type?: ToastType) => void
  dismissToast: (id: string) => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<'light' | 'dark'>('light')
  const [connection, setConnection] = useState<HealthCheckResult | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const toast = useCallback((title: string, message: string, type: ToastType = 'success') => {
    const id = crypto.randomUUID()
    setToasts((prev) => [...prev, { id, title, message, type }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4200)
  }, [])

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const reloadSettings = useCallback(async () => {
    const s = await helm().db.getSettings()
    setSettings(s)
    const nextTheme = (s.theme as 'light' | 'dark') || 'light'
    setThemeState(nextTheme)
    document.documentElement.dataset.theme = nextTheme
  }, [])

  const setTheme = useCallback(
    async (t: 'light' | 'dark') => {
      setThemeState(t)
      document.documentElement.dataset.theme = t
      await helm().db.setSettings({ theme: t })
      setSettings((prev) => ({ ...prev, theme: t }))
    },
    [],
  )

  const refreshConnection = useCallback(async () => {
    setRefreshing(true)
    try {
      const result = (await helm().api.healthCheck()) as HealthCheckResult
      setConnection(result)
      return result
    } finally {
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    ;(async () => {
      try {
        await reloadSettings()
        await refreshConnection()
      } catch (err) {
        toast('Falha ao iniciar', err instanceof Error ? err.message : String(err), 'error')
      }
    })()
  }, [reloadSettings, refreshConnection, toast])

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      connection,
      refreshing,
      refreshConnection,
      settings,
      reloadSettings,
      toasts,
      toast,
      dismissToast,
    }),
    [
      theme,
      setTheme,
      connection,
      refreshing,
      refreshConnection,
      settings,
      reloadSettings,
      toasts,
      toast,
      dismissToast,
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp fora do AppProvider')
  return ctx
}
