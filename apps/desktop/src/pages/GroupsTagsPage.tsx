import { useEffect, useState } from 'react'
import { Modal } from '../components/ui/Modal'
import { useApp } from '../context/AppContext'
import { asList, helm, pickId, pickName } from '../lib/helm'

export function GroupsTagsPage() {
  const { toast, connection } = useApp()
  const [groups, setGroups] = useState<any[]>([])
  const [tags, setTags] = useState<any[]>([])
  const [mode, setMode] = useState<'group' | 'tag'>('group')
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState('')
  const [name, setName] = useState('')

  async function load() {
    if (!connection?.ok) {
      setGroups([])
      setTags([])
      return
    }
    const [g, t] = await Promise.all([
      helm().api.call('getGroup', {}),
      helm().api.call('getTag', {}),
    ])
    if (!g.ok) toast('Erro grupos', g.error.message, 'error')
    if (!t.ok) toast('Erro tags', t.error.message, 'error')
    setGroups(asList(g.data))
    setTags(asList(t.data))
  }

  useEffect(() => {
    load().catch((err) => toast('Erro', String(err), 'error'))
  }, [connection?.ok])

  function startCreate(kind: 'group' | 'tag') {
    setMode(kind)
    setEditingId('')
    setName('')
    setOpen(true)
  }

  function startEdit(kind: 'group' | 'tag', row: any) {
    setMode(kind)
    setEditingId(pickId(row))
    setName(pickName(row))
    setOpen(true)
  }

  async function save() {
    if (!name.trim()) {
      toast('Campo obrigatório', 'Informe o nome.', 'warning')
      return
    }
    if (mode === 'group') {
      const res = editingId
        ? await helm().api.call('updateGroup', { id: Number(editingId) || editingId, name })
        : await helm().api.call('createGroup', { name })
      if (!res.ok) {
        // fallback common payload shapes
        const res2 = editingId
          ? await helm().api.call('updateGroup', {
              group_id: Number(editingId) || editingId,
              new_group_name: name,
            })
          : res
        if (!res2.ok) {
          toast('Falha', res2.error.message, 'error')
          return
        }
      }
    } else {
      const res = editingId
        ? await helm().api.call('updateTag', { id: Number(editingId) || editingId, name })
        : await helm().api.call('createTag', { name })
      if (!res.ok) {
        const res2 = editingId
          ? await helm().api.call('updateTag', {
              tag_id: Number(editingId) || editingId,
              new_tag_name: name,
            })
          : res
        if (!res2.ok) {
          toast('Falha', res2.error.message, 'error')
          return
        }
      }
    }
    toast('Salvo', name)
    setOpen(false)
    await load()
  }

  async function remove(kind: 'group' | 'tag', row: any) {
    const id = pickId(row)
    if (!confirm(`Excluir ${pickName(row)}?`)) return
    const method = kind === 'group' ? 'deleteGroup' : 'deleteTag'
    let res = await helm().api.call(method, { id: [Number(id) || id] })
    if (!res.ok) {
      res = await helm().api.call(method, {
        [kind === 'group' ? 'group_id' : 'tag_id']: [Number(id) || id],
      })
    }
    if (!res.ok) {
      toast('Falha ao excluir', res.error.message, 'error')
      return
    }
    toast('Excluído', pickName(row), 'warning')
    await load()
  }

  return (
    <>
      <div className="page-head">
        <div>
          <div className="eyebrow">Organização</div>
          <h1>Grupos e tags</h1>
          <p>CRUD de grupos e tags de perfil no ixBrowser.</p>
        </div>
        <div className="actions">
          <button className="btn btn-secondary" onClick={() => startCreate('tag')} disabled={!connection?.ok}>
            Nova tag
          </button>
          <button className="btn btn-primary" onClick={() => startCreate('group')} disabled={!connection?.ok}>
            Novo grupo
          </button>
        </div>
      </div>

      <div className="grid-2">
        <section className="panel table-panel">
          <div className="table-toolbar">
            <div>
              <h2 className="panel-title">Grupos</h2>
              <p className="panel-sub">{groups.length} grupo(s)</p>
            </div>
          </div>
          <div className="table-wrap">
            {groups.length === 0 ? (
              <div className="empty">Nenhum grupo.</div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>ID</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {groups.map((g) => (
                    <tr key={pickId(g)}>
                      <td>{pickName(g)}</td>
                      <td className="mono">{pickId(g)}</td>
                      <td>
                        <div className="row-actions">
                          <button className="btn btn-secondary btn-sm" onClick={() => startEdit('group', g)}>
                            Editar
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => remove('group', g)}>
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

        <section className="panel table-panel">
          <div className="table-toolbar">
            <div>
              <h2 className="panel-title">Tags de perfil</h2>
              <p className="panel-sub">{tags.length} tag(s)</p>
            </div>
          </div>
          <div className="table-wrap">
            {tags.length === 0 ? (
              <div className="empty">Nenhuma tag.</div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>ID</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {tags.map((t) => (
                    <tr key={pickId(t)}>
                      <td>
                        <span className="tag">{pickName(t)}</span>
                      </td>
                      <td className="mono">{pickId(t)}</td>
                      <td>
                        <div className="row-actions">
                          <button className="btn btn-secondary btn-sm" onClick={() => startEdit('tag', t)}>
                            Editar
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => remove('tag', t)}>
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
      </div>

      {open ? (
        <Modal
          title={`${editingId ? 'Editar' : 'Novo'} ${mode === 'group' ? 'grupo' : 'tag'}`}
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
          <div className="form-field">
            <label>Nome</label>
            <input className="field" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
        </Modal>
      ) : null}
    </>
  )
}
