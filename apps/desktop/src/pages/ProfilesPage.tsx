import { useEffect, useState } from 'react'
import { Modal } from '../components/ui/Modal'
import { useApp } from '../context/AppContext'
import { asList, helm, pickId, pickName } from '../lib/helm'

export function ProfilesPage() {
  const { toast, connection } = useApp()
  const [profiles, setProfiles] = useState<any[]>([])
  const [openedIds, setOpenedIds] = useState<Set<string>>(new Set())
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [cookiesOpen, setCookiesOpen] = useState(false)
  const [selectedId, setSelectedId] = useState('')
  const [name, setName] = useState('')
  const [cookiesJson, setCookiesJson] = useState('[]')
  const [lastDebug, setLastDebug] = useState('')

  async function load() {
    if (!connection?.ok) {
      setProfiles([])
      return
    }
    setLoading(true)
    try {
      const [list, opened] = await Promise.all([
        helm().api.call('getProfileList', {}),
        helm().api.call('getOpenedProfile', {}),
      ])
      if (!list.ok) toast('Erro ao listar perfis', list.error.message, 'error')
      setProfiles(asList(list.data))
      const openSet = new Set(asList(opened.data).map((p) => pickId(p)))
      setOpenedIds(openSet)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load().catch((err) => toast('Erro', String(err), 'error'))
  }, [connection?.ok])

  const filtered = profiles.filter((p) =>
    `${pickName(p)} ${pickId(p)}`.toLowerCase().includes(query.toLowerCase()),
  )

  async function createProfile() {
    if (!name.trim()) {
      toast('Campo obrigatório', 'Informe o nome do perfil.', 'warning')
      return
    }
    const res = await helm().api.call('createProfile', { name })
    if (!res.ok) {
      toast('Falha ao criar', res.error.message, 'error')
      return
    }
    toast('Perfil criado', name)
    setCreateOpen(false)
    setName('')
    await load()
  }

  async function copyProfile(p: any) {
    const id = pickId(p)
    const res = await helm().api.call('copyProfile', {
      profile_id: Number(id) || id,
      name: `${pickName(p)} (cópia)`,
    })
    if (!res.ok) {
      toast('Falha ao copiar', res.error.message, 'error')
      return
    }
    toast('Perfil copiado', pickName(p))
    await load()
  }

  async function deleteProfile(p: any) {
    const id = pickId(p)
    if (!confirm(`Excluir perfil ${pickName(p)}?`)) return
    const res = await helm().api.call('deleteProfile', { profile_id: [Number(id) || id] })
    if (!res.ok) {
      // fallback single id
      const res2 = await helm().api.call('deleteProfile', { profile_id: Number(id) || id })
      if (!res2.ok) {
        toast('Falha ao excluir', res2.error.message, 'error')
        return
      }
    }
    toast('Perfil excluído', pickName(p), 'warning')
    await load()
  }

  async function openProfile(p: any) {
    const id = pickId(p)
    const res = await helm().api.call('openProfile', { profile_id: Number(id) || id })
    if (!res.ok) {
      toast('Falha ao abrir', res.error.message, 'error')
      return
    }
    const data = res.data as any
    const debug = data?.debugging_address || data?.debuggingAddress || ''
    const webdriver = data?.webdriver || ''
    const text = [debug && `debugging_address: ${debug}`, webdriver && `webdriver: ${webdriver}`]
      .filter(Boolean)
      .join('\n')
    setLastDebug(text || JSON.stringify(data, null, 2))
    if (debug) {
      await navigator.clipboard.writeText(String(debug))
      toast('Perfil aberto', 'debugging_address copiado.')
    } else {
      toast('Perfil aberto', pickName(p))
    }
    await load()
  }

  async function closeProfile(p: any) {
    const id = pickId(p)
    const res = await helm().api.call('closeProfile', { profile_id: Number(id) || id })
    if (!res.ok) {
      toast('Falha ao fechar', res.error.message, 'error')
      return
    }
    toast('Perfil fechado', pickName(p))
    await load()
  }

  async function clearCache(p: any) {
    const id = pickId(p)
    const res = await helm().api.call('clearProfileCache', { profile_id: Number(id) || id })
    if (!res.ok) {
      toast('Falha', res.error.message, 'error')
      return
    }
    toast('Cache limpo', pickName(p))
  }

  async function openCookies(p: any) {
    const id = pickId(p)
    setSelectedId(id)
    const res = await helm().api.call('getProfileCookies', { profile_id: Number(id) || id })
    if (!res.ok) {
      toast('Falha ao ler cookies', res.error.message, 'error')
      return
    }
    setCookiesJson(JSON.stringify(res.data ?? [], null, 2))
    setCookiesOpen(true)
  }

  async function saveCookies() {
    try {
      const parsed = JSON.parse(cookiesJson)
      const res = await helm().api.call('updateProfileCookies', {
        profile_id: Number(selectedId) || selectedId,
        cookie: parsed,
      })
      if (!res.ok) {
        toast('Falha ao salvar cookies', res.error.message, 'error')
        return
      }
      toast('Cookies atualizados', selectedId)
      setCookiesOpen(false)
    } catch {
      toast('JSON inválido', 'Revise o conteúdo dos cookies.', 'warning')
    }
  }

  return (
    <>
      <div className="page-head">
        <div>
          <div className="eyebrow">ixBrowser</div>
          <h1>Perfis</h1>
          <p>CRUD, abrir/fechar, cookies e cache via API local.</p>
        </div>
        <div className="actions">
          <button className="btn btn-secondary" onClick={() => load()} disabled={loading}>
            Atualizar
          </button>
          <button
            className="btn btn-primary"
            onClick={() => setCreateOpen(true)}
            disabled={!connection?.ok}
          >
            Novo perfil
          </button>
        </div>
      </div>

      {!connection?.ok ? (
        <div className="panel empty">Conecte o ixBrowser em Configurações para gerenciar perfis.</div>
      ) : null}

      {lastDebug ? (
        <div className="panel">
          <div className="panel-head">
            <h2 className="panel-title">Debug do último openProfile</h2>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => navigator.clipboard.writeText(lastDebug)}
            >
              Copiar
            </button>
          </div>
          <pre className="mono" style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
            {lastDebug}
          </pre>
        </div>
      ) : null}

      <section className="panel table-panel">
        <div className="table-toolbar">
          <div>
            <h2 className="panel-title">Perfis</h2>
            <p className="panel-sub">
              {filtered.length} perfil(is) {loading ? '· carregando...' : ''}
            </p>
          </div>
          <label className="search-wrap">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar perfil..."
            />
          </label>
        </div>
        <div className="table-wrap">
          {filtered.length === 0 ? (
            <div className="empty">Nenhum perfil encontrado.</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>ID</th>
                  <th>Estado</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const id = pickId(p)
                  const isOpen = openedIds.has(id)
                  return (
                    <tr key={id}>
                      <td>
                        <strong>{pickName(p)}</strong>
                      </td>
                      <td className="mono">{id}</td>
                      <td>
                        <span className={`status ${isOpen ? 'status-active' : 'status-pending'}`}>
                          {isOpen ? 'Aberto' : 'Fechado'}
                        </span>
                      </td>
                      <td>
                        <div className="row-actions">
                          {isOpen ? (
                            <button className="btn btn-secondary btn-sm" onClick={() => closeProfile(p)}>
                              Fechar
                            </button>
                          ) : (
                            <button className="btn btn-primary btn-sm" onClick={() => openProfile(p)}>
                              Abrir
                            </button>
                          )}
                          <button className="btn btn-secondary btn-sm" onClick={() => openCookies(p)}>
                            Cookies
                          </button>
                          <button className="btn btn-secondary btn-sm" onClick={() => clearCache(p)}>
                            Cache
                          </button>
                          <button className="btn btn-secondary btn-sm" onClick={() => copyProfile(p)}>
                            Copiar
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => deleteProfile(p)}>
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {createOpen ? (
        <Modal
          title="Novo perfil"
          onClose={() => setCreateOpen(false)}
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => setCreateOpen(false)}>
                Cancelar
              </button>
              <button className="btn btn-primary" onClick={createProfile}>
                Criar
              </button>
            </>
          }
        >
          <div className="form-field">
            <label>Nome</label>
            <input className="field" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
        </Modal>
      ) : null}

      {cookiesOpen ? (
        <Modal
          title={`Cookies — perfil ${selectedId}`}
          onClose={() => setCookiesOpen(false)}
          wide
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => setCookiesOpen(false)}>
                Cancelar
              </button>
              <button className="btn btn-primary" onClick={saveCookies}>
                Salvar cookies
              </button>
            </>
          }
        >
          <div className="form-field">
            <label>JSON de cookies</label>
            <textarea className="textarea" style={{ minHeight: 280 }} value={cookiesJson} onChange={(e) => setCookiesJson(e.target.value)} />
          </div>
        </Modal>
      ) : null}
    </>
  )
}
