import { useEffect, useState } from 'react'
import { Modal } from '../components/ui/Modal'
import { useApp } from '../context/AppContext'
import { asList, helm, pickId, pickName } from '../lib/helm'

const emptyProxy = {
  proxy_type: 'socks5',
  proxy_ip: '',
  proxy_port: '',
  proxy_user: '',
  proxy_password: '',
  remark: '',
}

export function ProxiesPage() {
  const { toast, connection } = useApp()
  const [proxies, setProxies] = useState<any[]>([])
  const [proxyTags, setProxyTags] = useState<any[]>([])
  const [profiles, setProfiles] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  const [assignOpen, setAssignOpen] = useState(false)
  const [tagOpen, setTagOpen] = useState(false)
  const [form, setForm] = useState(emptyProxy)
  const [editingId, setEditingId] = useState('')
  const [tagName, setTagName] = useState('')
  const [assignProfileId, setAssignProfileId] = useState('')
  const [assignProxy, setAssignProxy] = useState(emptyProxy)

  async function load() {
    if (!connection?.ok) {
      setProxies([])
      setProxyTags([])
      setProfiles([])
      return
    }
    const [p, t, pr] = await Promise.all([
      helm().api.call('getProxyList', {}),
      helm().api.call('getProxyTag', {}),
      helm().api.call('getProfileList', {}),
    ])
    if (!p.ok) toast('Erro proxies', p.error.message, 'error')
    setProxies(asList(p.data))
    setProxyTags(asList(t.data))
    setProfiles(asList(pr.data))
  }

  useEffect(() => {
    load().catch((err) => toast('Erro', String(err), 'error'))
  }, [connection?.ok])

  function startCreate() {
    setEditingId('')
    setForm(emptyProxy)
    setOpen(true)
  }

  async function saveProxy() {
    if (!form.proxy_ip || !form.proxy_port) {
      toast('Campos obrigatórios', 'Informe IP e porta.', 'warning')
      return
    }
    const payload = { ...form }
    const res = editingId
      ? await helm().api.call('updateCustomProxy', {
          proxy_id: Number(editingId) || editingId,
          ...payload,
        })
      : await helm().api.call('createCustomProxy', payload)
    if (!res.ok) {
      toast('Falha', res.error.message, 'error')
      return
    }
    toast(editingId ? 'Proxy atualizado' : 'Proxy criado', `${form.proxy_ip}:${form.proxy_port}`)
    setOpen(false)
    await load()
  }

  async function removeProxy(row: any) {
    const id = pickId(row)
    if (!confirm(`Excluir proxy ${pickName(row) || id}?`)) return
    let res = await helm().api.call('deleteCustomProxy', { proxy_id: [Number(id) || id] })
    if (!res.ok) {
      res = await helm().api.call('deleteCustomProxy', { proxy_id: Number(id) || id })
    }
    if (!res.ok) {
      toast('Falha ao excluir', res.error.message, 'error')
      return
    }
    toast('Proxy excluído', String(id), 'warning')
    await load()
  }

  async function saveTag() {
    if (!tagName.trim()) {
      toast('Campo obrigatório', 'Informe o nome da tag.', 'warning')
      return
    }
    const res = await helm().api.call('createProxyTag', { name: tagName })
    if (!res.ok) {
      toast('Falha', res.error.message, 'error')
      return
    }
    toast('Tag criada', tagName)
    setTagOpen(false)
    setTagName('')
    await load()
  }

  async function assignToProfile() {
    if (!assignProfileId) {
      toast('Selecione um perfil', '', 'warning')
      return
    }
    const res = await helm().api.call('updateProfileProxyCustom', {
      profile_id: Number(assignProfileId) || assignProfileId,
      proxy_config: {
        proxy_mode: 2,
        proxy_type: assignProxy.proxy_type,
        proxy_ip: assignProxy.proxy_ip,
        proxy_port: assignProxy.proxy_port,
        proxy_user: assignProxy.proxy_user,
        proxy_password: assignProxy.proxy_password,
      },
    })
    if (!res.ok) {
      toast('Falha ao atribuir', res.error.message, 'error')
      return
    }
    toast('Proxy atribuído', `Perfil ${assignProfileId}`)
    setAssignOpen(false)
  }

  return (
    <>
      <div className="page-head">
        <div>
          <div className="eyebrow">Rede</div>
          <h1>Proxies</h1>
          <p>Proxies custom (HTTP/HTTPS/SOCKS5), tags e atribuição a perfis.</p>
        </div>
        <div className="actions">
          <button className="btn btn-secondary" onClick={() => setTagOpen(true)} disabled={!connection?.ok}>
            Nova tag
          </button>
          <button className="btn btn-secondary" onClick={() => setAssignOpen(true)} disabled={!connection?.ok}>
            Atribuir a perfil
          </button>
          <button className="btn btn-primary" onClick={startCreate} disabled={!connection?.ok}>
            Novo proxy
          </button>
        </div>
      </div>

      <section className="panel table-panel">
        <div className="table-toolbar">
          <div>
            <h2 className="panel-title">Proxies custom</h2>
            <p className="panel-sub">{proxies.length} proxy(s)</p>
          </div>
        </div>
        <div className="table-wrap">
          {proxies.length === 0 ? (
            <div className="empty">Nenhum proxy listado pela API.</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tipo</th>
                  <th>Host</th>
                  <th>Porta</th>
                  <th>Obs.</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {proxies.map((p) => {
                  const id = pickId(p)
                  return (
                    <tr key={id}>
                      <td className="mono">{id}</td>
                      <td>{p.proxy_type || p.type || '—'}</td>
                      <td>{p.proxy_ip || p.host || p.ip || '—'}</td>
                      <td>{p.proxy_port || p.port || '—'}</td>
                      <td>{p.remark || p.name || pickName(p)}</td>
                      <td>
                        <div className="row-actions">
                          <button className="btn btn-danger btn-sm" onClick={() => removeProxy(p)}>
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

      <section className="panel">
        <div className="panel-head">
          <div>
            <h2 className="panel-title">Tags de proxy</h2>
            <p className="panel-sub">{proxyTags.length} tag(s)</p>
          </div>
        </div>
        <div className="actions">
          {proxyTags.length === 0 ? (
            <span className="muted">Nenhuma tag de proxy.</span>
          ) : (
            proxyTags.map((t) => (
              <span key={pickId(t)} className="tag">
                {pickName(t)}
              </span>
            ))
          )}
        </div>
      </section>

      {open ? (
        <Modal
          title="Novo proxy custom"
          onClose={() => setOpen(false)}
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => setOpen(false)}>
                Cancelar
              </button>
              <button className="btn btn-primary" onClick={saveProxy}>
                Salvar
              </button>
            </>
          }
        >
          <div className="form-grid">
            <div className="form-field">
              <label>Tipo</label>
              <select
                className="field"
                value={form.proxy_type}
                onChange={(e) => setForm({ ...form, proxy_type: e.target.value })}
              >
                <option value="http">http</option>
                <option value="https">https</option>
                <option value="socks5">socks5</option>
              </select>
            </div>
            <div className="form-field">
              <label>IP / host</label>
              <input
                className="field"
                value={form.proxy_ip}
                onChange={(e) => setForm({ ...form, proxy_ip: e.target.value })}
              />
            </div>
            <div className="form-field">
              <label>Porta</label>
              <input
                className="field"
                value={form.proxy_port}
                onChange={(e) => setForm({ ...form, proxy_port: e.target.value })}
              />
            </div>
            <div className="form-field">
              <label>Usuário</label>
              <input
                className="field"
                value={form.proxy_user}
                onChange={(e) => setForm({ ...form, proxy_user: e.target.value })}
              />
            </div>
            <div className="form-field">
              <label>Senha</label>
              <input
                className="field"
                type="password"
                value={form.proxy_password}
                onChange={(e) => setForm({ ...form, proxy_password: e.target.value })}
              />
            </div>
            <div className="form-field">
              <label>Observação</label>
              <input
                className="field"
                value={form.remark}
                onChange={(e) => setForm({ ...form, remark: e.target.value })}
              />
            </div>
          </div>
        </Modal>
      ) : null}

      {tagOpen ? (
        <Modal
          title="Nova tag de proxy"
          onClose={() => setTagOpen(false)}
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => setTagOpen(false)}>
                Cancelar
              </button>
              <button className="btn btn-primary" onClick={saveTag}>
                Criar
              </button>
            </>
          }
        >
          <div className="form-field">
            <label>Nome</label>
            <input className="field" value={tagName} onChange={(e) => setTagName(e.target.value)} />
          </div>
        </Modal>
      ) : null}

      {assignOpen ? (
        <Modal
          title="Atribuir proxy custom a perfil"
          onClose={() => setAssignOpen(false)}
          wide
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => setAssignOpen(false)}>
                Cancelar
              </button>
              <button className="btn btn-primary" onClick={assignToProfile}>
                Atribuir
              </button>
            </>
          }
        >
          <div className="form-grid">
            <div className="form-field full">
              <label>Perfil</label>
              <select
                className="field"
                value={assignProfileId}
                onChange={(e) => setAssignProfileId(e.target.value)}
              >
                <option value="">Selecione</option>
                {profiles.map((p) => (
                  <option key={pickId(p)} value={pickId(p)}>
                    {pickName(p)} ({pickId(p)})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label>Tipo</label>
              <select
                className="field"
                value={assignProxy.proxy_type}
                onChange={(e) => setAssignProxy({ ...assignProxy, proxy_type: e.target.value })}
              >
                <option value="http">http</option>
                <option value="https">https</option>
                <option value="socks5">socks5</option>
              </select>
            </div>
            <div className="form-field">
              <label>IP</label>
              <input
                className="field"
                value={assignProxy.proxy_ip}
                onChange={(e) => setAssignProxy({ ...assignProxy, proxy_ip: e.target.value })}
              />
            </div>
            <div className="form-field">
              <label>Porta</label>
              <input
                className="field"
                value={assignProxy.proxy_port}
                onChange={(e) => setAssignProxy({ ...assignProxy, proxy_port: e.target.value })}
              />
            </div>
            <div className="form-field">
              <label>Usuário</label>
              <input
                className="field"
                value={assignProxy.proxy_user}
                onChange={(e) => setAssignProxy({ ...assignProxy, proxy_user: e.target.value })}
              />
            </div>
            <div className="form-field">
              <label>Senha</label>
              <input
                className="field"
                type="password"
                value={assignProxy.proxy_password}
                onChange={(e) => setAssignProxy({ ...assignProxy, proxy_password: e.target.value })}
              />
            </div>
          </div>
        </Modal>
      ) : null}
    </>
  )
}
