import { ConcurrencyQueue } from './queue'
import { IX_ENDPOINTS } from './endpoints'

export interface IxConnectionConfig {
  host: string
  port: number
  basePath: string
}

export interface IxApiResponse<T = unknown> {
  error: {
    code: number
    message: string
  }
  data: T
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

const DEFAULT_CONFIG: IxConnectionConfig = {
  host: '127.0.0.1',
  port: 53200,
  basePath: '/api/v2',
}

function normalizeBasePath(path: string): string {
  if (!path || path === '/') return ''
  return path.endsWith('/') ? path.slice(0, -1) : path
}

function buildBaseUrl(cfg: IxConnectionConfig): string {
  const base = normalizeBasePath(cfg.basePath)
  return `http://${cfg.host}:${cfg.port}${base}`
}

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

export class IxBrowserClient {
  private config: IxConnectionConfig = { ...DEFAULT_CONFIG }
  private readonly queue = new ConcurrencyQueue(3)

  setConfig(partial: Partial<IxConnectionConfig>) {
    this.config = { ...this.config, ...partial }
  }

  getConfig(): IxConnectionConfig {
    return { ...this.config }
  }

  listEndpoints() {
    return IX_ENDPOINTS
  }

  async rawRequest<T = unknown>(
    method: string,
    body: Record<string, unknown> = {},
    options?: { retries?: number; baseUrlOverride?: string },
  ): Promise<IxApiResponse<T>> {
    const retries = options?.retries ?? 1
    return this.queue.run(() => this.execute(method, body, retries, options?.baseUrlOverride))
  }

  private async execute<T>(
    method: string,
    body: Record<string, unknown>,
    retries: number,
    baseUrlOverride?: string,
  ): Promise<IxApiResponse<T>> {
    const baseUrl = baseUrlOverride ?? buildBaseUrl(this.config)
    const url = `${baseUrl}/${method}`
    let lastError: unknown

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body ?? {}),
        })

        const text = await res.text()
        let parsed: any = null
        try {
          parsed = text ? JSON.parse(text) : null
        } catch {
          parsed = { rawText: text }
        }

        // Formatos comuns: { error: { code, message }, data } ou { code, message, data }
        const code =
          parsed?.error?.code ??
          parsed?.code ??
          (res.ok ? 0 : res.status)
        const message =
          parsed?.error?.message ??
          parsed?.message ??
          (res.ok ? 'OK' : res.statusText)
        const data = (parsed?.data ?? parsed) as T
        const ok = Number(code) === 0 && res.ok

        return {
          error: { code: Number(code), message: String(message) },
          data,
          raw: parsed,
          ok,
          url,
          method,
        }
      } catch (err) {
        lastError = err
        if (attempt < retries) await sleep(300 * (attempt + 1))
      }
    }

    const message = lastError instanceof Error ? lastError.message : String(lastError)
    return {
      error: { code: -1, message },
      data: null as T,
      raw: null,
      ok: false,
      url,
      method,
    }
  }

  async healthCheck(): Promise<HealthCheckResult> {
    const candidates = [
      normalizeBasePath(this.config.basePath) || '/api/v2',
      '/api/v2',
      '',
    ]
    // unique
    const unique = [...new Set(candidates)]

    for (const basePath of unique) {
      const baseUrl = `http://${this.config.host}:${this.config.port}${basePath}`
      const started = Date.now()
      const result = await this.execute('getProfileList', {}, 0, baseUrl)
      const latencyMs = Date.now() - started

      if (result.ok || result.error.code === 0) {
        this.config.basePath = basePath || '/'
        return {
          ok: true,
          url: baseUrl,
          basePath: this.config.basePath,
          message: 'Conectado à API local do ixBrowser',
          latencyMs,
        }
      }

      // Se respondeu HTTP mas com erro de negócio, ainda está vivo
      if (result.error.code !== -1 && result.raw != null) {
        this.config.basePath = basePath || '/'
        return {
          ok: true,
          url: baseUrl,
          basePath: this.config.basePath,
          message: `API respondeu (${result.error.message})`,
          latencyMs,
        }
      }
    }

    return {
      ok: false,
      url: buildBaseUrl(this.config),
      basePath: this.config.basePath,
      message: 'Não foi possível conectar. Verifique se o ixBrowser está aberto e a API habilitada.',
      latencyMs: 0,
    }
  }

  // Helpers tipados de alto nível
  getProfileList(params: Record<string, unknown> = {}) {
    return this.rawRequest('getProfileList', params)
  }
  createProfile(params: Record<string, unknown>) {
    return this.rawRequest('createProfile', params)
  }
  updateProfile(params: Record<string, unknown>) {
    return this.rawRequest('updateProfile', params)
  }
  copyProfile(params: Record<string, unknown>) {
    return this.rawRequest('copyProfile', params)
  }
  deleteProfile(params: Record<string, unknown>) {
    return this.rawRequest('deleteProfile', params)
  }
  openProfile(params: Record<string, unknown>) {
    return this.rawRequest('openProfile', params)
  }
  closeProfile(params: Record<string, unknown>) {
    return this.rawRequest('closeProfile', params)
  }
  getOpenedProfile(params: Record<string, unknown> = {}) {
    return this.rawRequest('getOpenedProfile', params)
  }
  getProfileCookies(params: Record<string, unknown>) {
    return this.rawRequest('getProfileCookies', params)
  }
  updateProfileCookies(params: Record<string, unknown>) {
    return this.rawRequest('updateProfileCookies', params)
  }
  clearProfileCache(params: Record<string, unknown>) {
    return this.rawRequest('clearProfileCache', params)
  }
  clearProfileCacheAndCookies(params: Record<string, unknown>) {
    return this.rawRequest('clearProfileCacheAndCookies', params)
  }
  updateProfileProxyCustom(params: Record<string, unknown>) {
    return this.rawRequest('updateProfileProxyCustom', params)
  }
  getGroup(params: Record<string, unknown> = {}) {
    return this.rawRequest('getGroup', params)
  }
  createGroup(params: Record<string, unknown>) {
    return this.rawRequest('createGroup', params)
  }
  updateGroup(params: Record<string, unknown>) {
    return this.rawRequest('updateGroup', params)
  }
  deleteGroup(params: Record<string, unknown>) {
    return this.rawRequest('deleteGroup', params)
  }
  getTag(params: Record<string, unknown> = {}) {
    return this.rawRequest('getTag', params)
  }
  createTag(params: Record<string, unknown>) {
    return this.rawRequest('createTag', params)
  }
  updateTag(params: Record<string, unknown>) {
    return this.rawRequest('updateTag', params)
  }
  deleteTag(params: Record<string, unknown>) {
    return this.rawRequest('deleteTag', params)
  }
  getProxyList(params: Record<string, unknown> = {}) {
    return this.rawRequest('getProxyList', params)
  }
  createCustomProxy(params: Record<string, unknown>) {
    return this.rawRequest('createCustomProxy', params)
  }
  updateCustomProxy(params: Record<string, unknown>) {
    return this.rawRequest('updateCustomProxy', params)
  }
  deleteCustomProxy(params: Record<string, unknown>) {
    return this.rawRequest('deleteCustomProxy', params)
  }
  getProxyTag(params: Record<string, unknown> = {}) {
    return this.rawRequest('getProxyTag', params)
  }
  createProxyTag(params: Record<string, unknown>) {
    return this.rawRequest('createProxyTag', params)
  }
  updateProxyTag(params: Record<string, unknown>) {
    return this.rawRequest('updateProxyTag', params)
  }
  deleteProxyTag(params: Record<string, unknown>) {
    return this.rawRequest('deleteProxyTag', params)
  }
}

export const ixClient = new IxBrowserClient()
