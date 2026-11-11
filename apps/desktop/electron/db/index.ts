import fs from 'node:fs'
import path from 'node:path'
import { app } from 'electron'
import { randomUUID } from 'node:crypto'

export type ClientStatus = 'ativo' | 'pausado' | 'encerrado'
export type AccountStatus =
  | 'pendente_criacao'
  | 'aguardando_dados'
  | 'ativa'
  | 'em_revisao'
  | 'restrita'
  | 'suspensa'
  | 'encerrada'

export interface ClientRow {
  id: string
  name: string
  company: string
  contact: string
  status: ClientStatus
  notes: string
  created_at: string
  updated_at: string
}

export interface AccountRow {
  id: string
  client_id: string
  platform: string
  username: string
  email: string
  status: AccountStatus
  ix_profile_id: string
  proxy_note: string
  tags: string
  notes: string
  created_at: string
  updated_at: string
}

export interface JobRow {
  id: string
  type: string
  payload: string
  status: 'pending' | 'running' | 'done' | 'failed'
  result: string
  created_at: string
  updated_at: string
}

export type SettingsMap = Record<string, string>

interface DbShape {
  settings: SettingsMap
  clients: ClientRow[]
  accounts: AccountRow[]
  job_queue: JobRow[]
}

const DEFAULT_SETTINGS: SettingsMap = {
  host: '127.0.0.1',
  port: '53200',
  basePath: '/api/v2',
  theme: 'light',
  language: 'pt-BR',
}

let dbPath = ''
let state: DbShape = {
  settings: { ...DEFAULT_SETTINGS },
  clients: [],
  accounts: [],
  job_queue: [],
}

function nowIso() {
  return new Date().toISOString()
}

function persist() {
  if (!dbPath) return
  fs.writeFileSync(dbPath, JSON.stringify(state, null, 2), 'utf-8')
}

export async function initDatabase() {
  const userData = app.getPath('userData')
  dbPath = path.join(userData, 'helm-db.json')

  if (fs.existsSync(dbPath)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(dbPath, 'utf-8')) as Partial<DbShape>
      state = {
        settings: { ...DEFAULT_SETTINGS, ...(parsed.settings || {}) },
        clients: parsed.clients || [],
        accounts: parsed.accounts || [],
        job_queue: parsed.job_queue || [],
      }
    } catch {
      state = {
        settings: { ...DEFAULT_SETTINGS },
        clients: [],
        accounts: [],
        job_queue: [],
      }
      persist()
    }
  } else {
    persist()
  }

  return state
}

export function getSettings(): SettingsMap {
  return { ...state.settings }
}

export function setSettings(partial: SettingsMap) {
  state.settings = { ...state.settings, ...partial }
  persist()
  return getSettings()
}

export function listClients(): ClientRow[] {
  return [...state.clients].sort((a, b) => b.updated_at.localeCompare(a.updated_at))
}

export function getClient(id: string): ClientRow | null {
  return state.clients.find((c) => c.id === id) ?? null
}

export function upsertClient(input: Partial<ClientRow> & { name: string }): ClientRow {
  const id = input.id || randomUUID()
  const existing = getClient(id)
  const ts = nowIso()
  const row: ClientRow = {
    id,
    name: input.name,
    company: input.company ?? existing?.company ?? '',
    contact: input.contact ?? existing?.contact ?? '',
    status: (input.status as ClientStatus) ?? existing?.status ?? 'ativo',
    notes: input.notes ?? existing?.notes ?? '',
    created_at: existing?.created_at ?? ts,
    updated_at: ts,
  }
  if (existing) {
    state.clients = state.clients.map((c) => (c.id === id ? row : c))
  } else {
    state.clients.push(row)
  }
  persist()
  return row
}

export function deleteClient(id: string) {
  state.accounts = state.accounts.filter((a) => a.client_id !== id)
  state.clients = state.clients.filter((c) => c.id !== id)
  persist()
}

export function listAccounts(clientId?: string): AccountRow[] {
  const rows = clientId
    ? state.accounts.filter((a) => a.client_id === clientId)
    : [...state.accounts]
  return rows.sort((a, b) => b.updated_at.localeCompare(a.updated_at))
}

export function getAccount(id: string): AccountRow | null {
  return state.accounts.find((a) => a.id === id) ?? null
}

export function upsertAccount(
  input: Partial<AccountRow> & { client_id: string; username: string },
): AccountRow {
  const id = input.id || randomUUID()
  const existing = getAccount(id)
  const ts = nowIso()
  const row: AccountRow = {
    id,
    client_id: input.client_id,
    platform: input.platform ?? existing?.platform ?? '',
    username: input.username,
    email: input.email ?? existing?.email ?? '',
    status: (input.status as AccountStatus) ?? existing?.status ?? 'ativa',
    ix_profile_id: input.ix_profile_id ?? existing?.ix_profile_id ?? '',
    proxy_note: input.proxy_note ?? existing?.proxy_note ?? '',
    tags: input.tags ?? existing?.tags ?? '',
    notes: input.notes ?? existing?.notes ?? '',
    created_at: existing?.created_at ?? ts,
    updated_at: ts,
  }
  if (existing) {
    state.accounts = state.accounts.map((a) => (a.id === id ? row : a))
  } else {
    state.accounts.push(row)
  }
  persist()
  return row
}

export function deleteAccount(id: string) {
  state.accounts = state.accounts.filter((a) => a.id !== id)
  persist()
}

export function enqueueJob(type: string, payload: Record<string, unknown> = {}): JobRow {
  const ts = nowIso()
  const row: JobRow = {
    id: randomUUID(),
    type,
    payload: JSON.stringify(payload),
    status: 'pending',
    result: '',
    created_at: ts,
    updated_at: ts,
  }
  state.job_queue.unshift(row)
  persist()
  return row
}

export function listJobs(): JobRow[] {
  return state.job_queue.slice(0, 100)
}

export function updateJob(id: string, patch: Partial<Pick<JobRow, 'status' | 'result'>>) {
  const current = state.job_queue.find((j) => j.id === id)
  if (!current) return null
  current.status = patch.status ?? current.status
  current.result = patch.result ?? current.result
  current.updated_at = nowIso()
  persist()
  return { ...current }
}
