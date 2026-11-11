import { useEffect, useState } from 'react'
import { Modal } from '../components/ui/Modal'
import { useApp } from '../context/AppContext'
import { asList, helm, pickId, pickName } from '../lib/helm'
import type { Account, Client } from '../lib/types'

const emptyForm = {
  id: '',
  client_id: '',
  platform: 'Instagram',
  username: '',
  email: '',
  status: 'ativa',
  ix_profile_id: '',
  proxy_note: '',
  tags: '',
  notes: '',
}

export function AccountsPage() {
  const { toast, connection } = useApp()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [profiles, setProfiles] = useState<any[]>([])
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [debugInfo, setDebugInfo] = useState<string>('')

  async function load() {
    const [a, c] = await Promise.all([helm().db.listAccounts(), helm().db.listClients()])
    setAccounts(a)
    setClients(c)
    if (connection?.ok) {
      const res = await helm().api.call('getProfileList', {})
      setProfiles(asList(res.data))
    }
  }

  useEffect(() => {
    load().catch((err) => toast('Erro', String(err), 'error'))
  }, [connection?.ok, toast])

  const clientName = (id: string) => clients.find((c) => c.id === id)?.name ?? '—'

  const filtered = accounts.filter((a) =>
    `${a.username} ${a.platform} ${a.ix_profile_id} ${clientName(a.client_id)}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  )

  function startCreate() {
    setForm({ ...emptyForm, client_id: clients[0]?.id ?? '' })
    setOpen(true)
  }

  function startEdit(a: Account) {
    setForm({ ...a })
    setOpen(true)
  }

  async function save() {
    if (!form.client_id || !form.username.trim()) {
      toast('Campos obrigatórios', 'Informe cliente e usuário.', 'warning')
      return
    }
    await helm().db.upsertAccount(form)
    toast('Conta salva', form.username)
    setOpen(false)
    await load()
  }

  async function remove(id: string, username: string) {
    if (!confirm(`Excluir conta "${username}"?`)) return
    await helm().db.deleteAccount(id)
    toast('Conta excluída', username, 'warning')
    await load()
  }

  async function openLinkedProfile(a: Account) {
    if (!a.ix_profile_id) {
      toast('Sem vínculo', 'Vincule um perfil ixBrowser antes.', 'warning')
      return
    }
    const res = await helm().api.call('openProfile', {
      profile_id: Number(a.ix_profile_id) || a.ix_profile_id,
    })
    if (!res.ok) {
      toast('Falha ao abrir', res.error.message, 'error')
      return
    }
    const data = res.data as any
    const debug = data?.debugging_address || data?.debuggingAddress || data?.ws?.debugger_address
    const webdriver = data?.webdriver
    const info = [debug && `CDP: ${debug}`, webdriver && `WebDriver: ${webdriver}`]
      .filter(Boolean)
      .join('\n')
    setDebugInfo(info)
    if (debug) {
      await navigator.clipboard.writeText(String(debug))
      toast('Perfil aberto', 'debugging_address copiado.')
    } else {
      toast('Perfil aberto', 'Sem debugging_address no retorno.')
    }
  }

  return (
    <>
      <div className="page-head">
        <div>
          <div className="eyebrow">Vínculos Helm ↔ ixBrowser</div>
          <h1>Contas</h1>
          <p>Cadastre contas e vincule ao profile_id do ixBrowser.</p>
        </div>
        <div className="actions">
          <button className="btn btn-primary" onClick={startCreate} disabled={!clients.length}>
            Nova conta
          </button>
        </div>
      </div>

      {!clients.length ? (
        <div className="panel empty">Cadastre um cliente antes de criar contas.</div>
      ) : null}

      {debugInfo ? (
        <div className="panel">
          <div className="panel-head">
            <h2 className="panel-title">Último endpoint de debug</h2>
            <button className="btn btn-ghost btn-sm" onClick={() => setDebugInfo('')}>
              Limpar
            </button>
          </div>
          <pre className="mono" style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
            {debugInfo}
          </pre>
        </div>
      ) : null}

      <section className="panel table-panel">
        <div className="table-toolbar">
          <div>
            <h2 className="panel-title">Contas gerenciadas</h2>
            <p className="panel-sub">{filtered.length} registro(s)</p>
          </div>
          <label className="search-wrap">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar conta..."
            />
          </label>
        </div>
        <div className="table-wrap">
          {filtered.length === 0 ? (
            <div className="empty">Nenhuma conta encontrada.</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Usuário</th>
                  <th>Plataforma</th>
                  <th>Perfil ix</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => (
                  <tr key={a.id}>
                    <td>{clientName(a.client_id)}</td>
                    <td>
                      <strong>{a.username}</strong>
                    </td>
                    <td>{a.platform || '—'}</td>
                    <td className="mono">{a.ix_profile_id || '—'}</td>
                    <td>
                      <span className="status status-active">{a.status}</span>
                    </td>
                    <td>
                      <div className="row-actions">
                        <button className="btn btn-secondary btn-sm" onClick={() => openLinkedProfile(a)}>
                          Abrir
                        </button>
                        <button className="btn btn-secondary btn-sm" onClick={() => startEdit(a)}>
                          Editar
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => remove(a.id, a.username)}
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {open ? (
        <Modal
          title={form.id ? 'Editar conta' : 'Nova conta'}
          onClose={() => setOpen(false)}
          wide
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => setOpen(false)}>
                Cancelar
              </button>
              <button className="btn btn-primary" onClick={save}>
                Salvar
              </button>
            </>
          }
        >
          <div className="form-grid">
            <div className="form-field">
              <label>Cliente</label>
              <select
                className="field"
                value={form.client_id}
                onChange={(e) => setForm({ ...form, client_id: e.target.value })}
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label>Plataforma</label>
              <select
                className="field"
                value={form.platform}
                onChange={(e) => setForm({ ...form, platform: e.target.value })}
              >
                <option>Instagram</option>
                <option>Facebook</option>
                <option>TikTok</option>
                <option>Google</option>
                <option>Outra</option>
              </select>
            </div>
            <div className="form-field">
              <label>Usuário</label>
              <input
                className="field"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
              />
            </div>
            <div className="form-field">
              <label>E-mail</label>
              <input
                className="field"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="form-field">
              <label>Status</label>
              <select
                className="field"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="pendente_criacao">pendente_criacao</option>
                <option value="aguardando_dados">aguardando_dados</option>
                <option value="ativa">ativa</option>
                <option value="em_revisao">em_revisao</option>
                <option value="restrita">restrita</option>
                <option value="suspensa">suspensa</option>
                <option value="encerrada">encerrada</option>
              </select>
            </div>
            <div className="form-field">
              <label>Perfil ixBrowser</label>
              <select
                className="field"
                value={form.ix_profile_id}
                onChange={(e) => setForm({ ...form, ix_profile_id: e.target.value })}
              >
                <option value="">Sem vínculo</option>
                {profiles.map((p) => {
                  const id = pickId(p)
                  return (
                    <option key={id} value={id}>
                      {pickName(p)} ({id})
                    </option>
                  )
                })}
              </select>
            </div>
            <div className="form-field">
              <label>Nota de proxy</label>
              <input
                className="field"
                value={form.proxy_note}
                onChange={(e) => setForm({ ...form, proxy_note: e.target.value })}
              />
            </div>
            <div className="form-field">
              <label>Tags</label>
              <input
                className="field"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
              />
            </div>
            <div className="form-field full">
              <label>Observações</label>
              <textarea
                className="textarea"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>
          </div>
        </Modal>
      ) : null}
    </>
  )
}
