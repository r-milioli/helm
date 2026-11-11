import { app, BrowserWindow, ipcMain, shell } from 'electron'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { ixClient } from './ixbrowser/client'
import {
  deleteAccount,
  deleteClient,
  enqueueJob,
  getSettings,
  initDatabase,
  listAccounts,
  listClients,
  listJobs,
  setSettings,
  upsertAccount,
  upsertClient,
} from './db/index'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

process.env.DIST = path.join(__dirname, '../dist')
process.env.VITE_PUBLIC = app.isPackaged
  ? process.env.DIST
  : path.join(process.env.DIST, '../public')

let win: BrowserWindow | null = null
const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL

async function createWindow() {
  win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    title: 'Helm',
    backgroundColor: '#F5F7FB',
    webPreferences: {
      preload: path.join(
        __dirname,
        fs.existsSync(path.join(__dirname, 'preload.mjs')) ? 'preload.mjs' : 'preload.js',
      ),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  })

  if (VITE_DEV_SERVER_URL) {
    await win.loadURL(VITE_DEV_SERVER_URL)
    win.webContents.openDevTools({ mode: 'detach' })
  } else {
    await win.loadFile(path.join(process.env.DIST!, 'index.html'))
  }
}

function registerIpc() {
  ipcMain.handle('ix:healthCheck', async () => ixClient.healthCheck())
  ipcMain.handle('ix:rawRequest', async (_e, method: string, body: Record<string, unknown>) =>
    ixClient.rawRequest(method, body),
  )
  ipcMain.handle('ix:call', async (_e, method: string, body: Record<string, unknown>) =>
    ixClient.rawRequest(method, body),
  )
  ipcMain.handle('ix:listEndpoints', async () => ixClient.listEndpoints())
  ipcMain.handle('ix:getConfig', async () => ixClient.getConfig())
  ipcMain.handle('ix:setConfig', async (_e, cfg: Record<string, unknown>) => {
    ixClient.setConfig({
      host: String(cfg.host ?? '127.0.0.1'),
      port: Number(cfg.port ?? 53200),
      basePath: String(cfg.basePath ?? '/api/v2'),
    })
    setSettings({
      host: String(cfg.host ?? '127.0.0.1'),
      port: String(cfg.port ?? 53200),
      basePath: String(cfg.basePath ?? '/api/v2'),
    })
    return ixClient.getConfig()
  })

  ipcMain.handle('db:getSettings', async () => getSettings())
  ipcMain.handle('db:setSettings', async (_e, partial: Record<string, string>) => {
    const settings = setSettings(partial)
    if (partial.host || partial.port || partial.basePath) {
      ixClient.setConfig({
        host: settings.host,
        port: Number(settings.port),
        basePath: settings.basePath,
      })
    }
    return settings
  })
  ipcMain.handle('db:listClients', async () => listClients())
  ipcMain.handle('db:upsertClient', async (_e, input) => upsertClient(input))
  ipcMain.handle('db:deleteClient', async (_e, id: string) => {
    deleteClient(id)
    return true
  })
  ipcMain.handle('db:listAccounts', async (_e, clientId?: string) => listAccounts(clientId))
  ipcMain.handle('db:upsertAccount', async (_e, input) => upsertAccount(input))
  ipcMain.handle('db:deleteAccount', async (_e, id: string) => {
    deleteAccount(id)
    return true
  })
  ipcMain.handle('db:listJobs', async () => listJobs())
  ipcMain.handle('db:enqueueJob', async (_e, type: string, payload: Record<string, unknown>) =>
    enqueueJob(type, payload),
  )

  ipcMain.handle('app:getVersion', async () => app.getVersion())
  ipcMain.handle('app:openExternal', async (_e, url: string) => {
    await shell.openExternal(url)
    return true
  })
}

app.whenReady().then(async () => {
  try {
    await initDatabase()
    const settings = getSettings()
    ixClient.setConfig({
      host: settings.host || '127.0.0.1',
      port: Number(settings.port || 53200),
      basePath: settings.basePath || '/api/v2',
    })
    registerIpc()
    await createWindow()
  } catch (err) {
    console.error('Falha ao iniciar o Helm:', err)
    app.quit()
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
