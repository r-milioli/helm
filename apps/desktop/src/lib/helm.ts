export function helm() {
  if (!window.helm) {
    throw new Error('API do Helm indisponível. Execute o app pelo Electron.')
  }
  return window.helm
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
