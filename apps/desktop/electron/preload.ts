import { contextBridge, ipcRenderer } from 'electron'

const helm = {
  api: {
    healthCheck: () => ipcRenderer.invoke('ix:healthCheck'),
    rawRequest: (method: string, body?: Record<string, unknown>) =>
      ipcRenderer.invoke('ix:rawRequest', method, body ?? {}),
    listEndpoints: () => ipcRenderer.invoke('ix:listEndpoints'),
    getConfig: () => ipcRenderer.invoke('ix:getConfig'),
    setConfig: (cfg: Record<string, unknown>) => ipcRenderer.invoke('ix:setConfig', cfg),
    call: (method: string, body?: Record<string, unknown>) =>
      ipcRenderer.invoke('ix:call', method, body ?? {}),
  },
  db: {
    getSettings: () => ipcRenderer.invoke('db:getSettings'),
    setSettings: (partial: Record<string, string>) => ipcRenderer.invoke('db:setSettings', partial),
    listClients: () => ipcRenderer.invoke('db:listClients'),
    upsertClient: (input: Record<string, unknown>) => ipcRenderer.invoke('db:upsertClient', input),
    deleteClient: (id: string) => ipcRenderer.invoke('db:deleteClient', id),
    listAccounts: (clientId?: string) => ipcRenderer.invoke('db:listAccounts', clientId),
    upsertAccount: (input: Record<string, unknown>) => ipcRenderer.invoke('db:upsertAccount', input),
    deleteAccount: (id: string) => ipcRenderer.invoke('db:deleteAccount', id),
    listJobs: () => ipcRenderer.invoke('db:listJobs'),
    enqueueJob: (type: string, payload?: Record<string, unknown>) =>
      ipcRenderer.invoke('db:enqueueJob', type, payload ?? {}),
  },
  app: {
    getVersion: () => ipcRenderer.invoke('app:getVersion'),
    openExternal: (url: string) => ipcRenderer.invoke('app:openExternal', url),
  },
}

contextBridge.exposeInMainWorld('helm', helm)

export type HelmApi = typeof helm
