/// <reference types="vite/client" />

declare module '*.png' {
  const src: string
  export default src
}

interface HelmApi {
  api: {
    healthCheck: () => Promise<{
      ok: boolean
      url: string
      basePath: string
      message: string
      latencyMs: number
    }>
    rawRequest: (method: string, body?: Record<string, unknown>) => Promise<{
      error: { code: number; message: string }
      data: unknown
      raw: unknown
      ok: boolean
      url: string
      method: string
    }>
    listEndpoints: () => Promise<
      Array<{
        method: string
        category: string
        label: string
        description: string
        sampleBody?: Record<string, unknown>
      }>
    >
    getConfig: () => Promise<{ host: string; port: number; basePath: string }>
    setConfig: (cfg: Record<string, unknown>) => Promise<{ host: string; port: number; basePath: string }>
    call: (method: string, body?: Record<string, unknown>) => Promise<{
      error: { code: number; message: string }
      data: unknown
      raw: unknown
      ok: boolean
      url: string
      method: string
    }>
  }
  db: {
    getSettings: () => Promise<Record<string, string>>
    setSettings: (partial: Record<string, string>) => Promise<Record<string, string>>
    listClients: () => Promise<any[]>
    upsertClient: (input: Record<string, unknown>) => Promise<any>
    deleteClient: (id: string) => Promise<boolean>
    listAccounts: (clientId?: string) => Promise<any[]>
    upsertAccount: (input: Record<string, unknown>) => Promise<any>
    deleteAccount: (id: string) => Promise<boolean>
    listJobs: () => Promise<any[]>
    enqueueJob: (type: string, payload?: Record<string, unknown>) => Promise<any>
  }
  app: {
    getVersion: () => Promise<string>
    openExternal: (url: string) => Promise<boolean>
  }
}

declare global {
  interface Window {
    helm: HelmApi
  }
}

export {}
