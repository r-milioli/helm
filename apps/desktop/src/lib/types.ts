export interface Client {
  id: string
  name: string
  company: string
  contact: string
  status: string
  notes: string
  created_at: string
  updated_at: string
}

export interface Account {
  id: string
  client_id: string
  platform: string
  username: string
  email: string
  status: string
  ix_profile_id: string
  proxy_note: string
  tags: string
  notes: string
  created_at: string
  updated_at: string
}

export interface EndpointDef {
  method: string
  category: string
  label: string
  description: string
  sampleBody?: Record<string, unknown>
}

export interface IxResponse {
  error: { code: number; message: string }
  data: unknown
  raw: unknown
  ok: boolean
  url: string
  method: string
}

export interface HealthCheckResult {
  ok: boolean
  url: string
  basePath: string
  message: string
  latencyMs: number
}
