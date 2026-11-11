export function isHelmReady() {
  return typeof window !== 'undefined' && Boolean(window.helm)
}

export function helm() {
  if (!isHelmReady()) {
    throw new Error('API do Helm indisponível. Execute o app com npm run dev (janela Electron), não pelo navegador.')
  }
  return window.helm
}

export async function withHelm<T>(fn: (api: typeof window.helm) => Promise<T>): Promise<T> {
  if (!isHelmReady()) {
    throw new Error('API do Helm indisponível. Execute o app com npm run dev (janela Electron), não pelo navegador.')
  }
  return fn(window.helm)
}

export function asList(data: unknown): any[] {
  if (Array.isArray(data)) return data
  if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>
    for (const key of ['data', 'list', 'rows', 'profiles', 'items', 'result']) {
      if (Array.isArray(obj[key])) return obj[key] as any[]
    }
  }
  return []
}

export function pickId(row: any): string {
  return String(row?.profile_id ?? row?.id ?? row?.proxy_id ?? row?.group_id ?? row?.tag_id ?? '')
}

export function pickName(row: any): string {
  return String(row?.name ?? row?.profile_name ?? row?.title ?? row?.tag_name ?? row?.group_name ?? '—')
}
