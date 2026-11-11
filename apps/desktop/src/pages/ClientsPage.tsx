import { useEffect, useState } from 'react'
import { Modal } from '../components/ui/Modal'
import { useApp } from '../context/AppContext'
import { helm } from '../lib/helm'
import type { Client } from '../lib/types'

const emptyForm = {
  id: '',
  name: '',
  company: '',
  contact: '',
  status: 'ativo',
  notes: '',
}

export function ClientsPage() {
  const { toast } = useApp()
  const [clients, setClients] = useState<Client[]>([])
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)

  async function load() {
    setClients(await helm().db.listClients())
  }

  useEffect(() => {
    load().catch((err) => toast('Erro', String(err), 'error'))
  }, [toast])

  const filtered = clients.filter((c) =>
    `${c.name} ${c.company} ${c.contact}`.toLowerCase().includes(query.toLowerCase()),
  )

  function startCreate() {
    setForm(emptyForm)
    setOpen(true)
  }

  function startEdit(c: Client) {
    setForm({
      id: c.id,
      name: c.name,
      company: c.company,
      contact: c.contact,
      status: c.status,
      notes: c.notes,
    })
    setOpen(true)
  }

  async function save() {
    if (!form.name.trim()) {
      toast('Campo obrigatório', 'Informe o nome do cliente.', 'warning')
      return
    }
    await helm().db.upsertClient(form)
    toast('Cliente salvo', form.name)
    setOpen(false)
    await load()
  }

  async function remove(id: string, name: string) {
    if (!confirm(`Excluir cliente "${name}" e suas contas?`)) return
    await helm().db.deleteClient(id)
    toast('Cliente excluído', name, 'warning')
    await load()
  }

  return (
    <>
      <div className="page-head">
        <div>
          <div className="eyebrow">Cadastro local</div>
          <h1>Clientes</h1>
          <p>Clientes da agência vinculados às contas e perfis do ixBrowser.</p>
        </div>
        <div className="actions">
          <button className="btn btn-primary" onClick={startCreate}>
            Novo cliente
          </button>
        </div>
      </div>

      <section className="panel table-panel">
        <div className="table-toolbar">
          <div>
            <h2 className="panel-title">Lista de clientes</h2>
            <p className="panel-sub">{filtered.length} registro(s)</p>
          </div>
          <label className="search-wrap">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar cliente..."
            />
          </label>
        </div>
        <div className="table-wrap">
          {filtered.length === 0 ? (
            <div className="empty">Nenhum cliente encontrado.</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Empresa</th>
                  <th>Contato</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <strong>{c.name}</strong>
                    </td>
                    <td>{c.company || '—'}</td>
                    <td>{c.contact || '—'}</td>
                    <td>
                      <span className="status status-active">{c.status}</span>
                    </td>
                    <td>
                      <div className="row-actions">
                        <button className="btn btn-secondary btn-sm" onClick={() => startEdit(c)}>
                          Editar
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => remove(c.id, c.name)}
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
          title={form.id ? 'Editar cliente' : 'Novo cliente'}
          onClose={() => setOpen(false)}
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
            <div className="form-field full">
              <label>Nome</label>
              <input
                className="field"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="form-field">
              <label>Empresa</label>
              <input
                className="field"
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
              />
            </div>
            <div className="form-field">
              <label>Contato</label>
              <input
                className="field"
                value={form.contact}
                onChange={(e) => setForm({ ...form, contact: e.target.value })}
              />
            </div>
            <div className="form-field">
              <label>Status</label>
              <select
                className="field"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="ativo">ativo</option>
                <option value="pausado">pausado</option>
                <option value="encerrado">encerrado</option>
              </select>
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
