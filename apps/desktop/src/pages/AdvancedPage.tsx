import { useEffect, useMemo, useState } from 'react'
import { useApp } from '../context/AppContext'
import { helm } from '../lib/helm'
import type { EndpointDef, IxResponse } from '../lib/types'

interface HistoryItem {
  id: string
  at: string
  method: string
  ok: boolean
  message: string
  response: IxResponse
}

export function AdvancedPage() {
  const { toast } = useApp()
  const [endpoints, setEndpoints] = useState<EndpointDef[]>([])
  const [method, setMethod] = useState('getProfileList')
  const [category, setCategory] = useState('all')
  const [bodyText, setBodyText] = useState('{}')
  const [responseText, setResponseText] = useState('')
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState<HistoryItem[]>([])

  useEffect(() => {
    ;(async () => {
      try {
        const list = await helm().api.listEndpoints()
        setEndpoints(list)
        if (list[0]) {
          setMethod(list[0].method)
          setBodyText(JSON.stringify(list[0].sampleBody ?? {}, null, 2))
        }
      } catch (err) {
        toast('Erro', err instanceof Error ? err.message : String(err), 'error')
      }
    })()
  }, [toast])

  const filtered = useMemo(
    () => (category === 'all' ? endpoints : endpoints.filter((e) => e.category === category)),
    [endpoints, category],
  )

  const selected = endpoints.find((e) => e.method === method)

  function onSelectMethod(next: string) {
    setMethod(next)
    const ep = endpoints.find((e) => e.method === next)
    setBodyText(JSON.stringify(ep?.sampleBody ?? {}, null, 2))
  }

  async function send() {
    let body: Record<string, unknown> = {}
    try {
      body = JSON.parse(bodyText || '{}')
    } catch {
      toast('JSON inválido', 'Revise o corpo da requisição.', 'warning')
      return
    }
    setLoading(true)
    try {
      const res = (await helm().api.rawRequest(method, body)) as IxResponse
      setResponseText(JSON.stringify(res, null, 2))
      setHistory((prev) => [
        {
          id: crypto.randomUUID(),
          at: new Date().toLocaleTimeString('pt-BR'),
          method,
          ok: res.ok,
          message: res.error.message,
          response: res,
        },
        ...prev,
      ].slice(0, 20))
      toast(res.ok ? 'Sucesso' : 'Erro da API', res.error.message, res.ok ? 'success' : 'error')
    } catch (err) {
      toast('Falha na chamada', String(err), 'error')
    } finally {
      setLoading(false)
    }
  }

  const categories = ['all', ...new Set(endpoints.map((e) => e.category))]

  return (
    <>
      <div className="page-head">
        <div>
          <div className="eyebrow">Debug</div>
          <h1>Avançado</h1>
          <p>Catálogo completo dos endpoints tipados com request/response raw.</p>
        </div>
        <div className="actions">
          <button className="btn btn-primary" onClick={send} disabled={loading}>
            {loading ? 'Enviando...' : 'Enviar request'}
          </button>
        </div>
      </div>

      <div className="grid-2">
        <section className="panel">
          <div className="panel-head">
            <div>
              <h2 className="panel-title">Request</h2>
              <p className="panel-sub">{endpoints.length} endpoints disponíveis</p>
            </div>
          </div>
          <div className="form-grid">
            <div className="form-field">
              <label>Categoria</label>
              <select className="field" value={category} onChange={(e) => setCategory(e.target.value)}>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label>Método</label>
              <select className="field" value={method} onChange={(e) => onSelectMethod(e.target.value)}>
                {filtered.map((e) => (
                  <option key={e.method} value={e.method}>
                    {e.method}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-field full">
              <label>{selected?.label ?? 'Endpoint'}</label>
              <p className="muted" style={{ margin: 0 }}>
                {selected?.description}
              </p>
            </div>
            <div className="form-field full">
              <label>Body JSON</label>
              <textarea
                className="textarea"
                style={{ minHeight: 260 }}
                value={bodyText}
                onChange={(e) => setBodyText(e.target.value)}
              />
            </div>
          </div>
        </section>

        <section className="panel">
          <div className="panel-head">
            <div>
              <h2 className="panel-title">Response</h2>
              <p className="panel-sub">Última resposta da API</p>
            </div>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => responseText && navigator.clipboard.writeText(responseText)}
              disabled={!responseText}
            >
              Copiar
            </button>
          </div>
          <textarea
            className="textarea"
            style={{ minHeight: 360 }}
            readOnly
            value={responseText || '// A resposta aparecerá aqui'}
          />
        </section>
      </div>

      <section className="panel table-panel">
        <div className="table-toolbar">
          <div>
            <h2 className="panel-title">Histórico recente</h2>
            <p className="panel-sub">Últimas 20 chamadas nesta sessão</p>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => setHistory([])}>
            Limpar
          </button>
        </div>
        <div className="table-wrap">
          {history.length === 0 ? (
            <div className="empty">Nenhuma chamada ainda.</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Hora</th>
                  <th>Método</th>
                  <th>Status</th>
                  <th>Mensagem</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h.id}>
                    <td>{h.at}</td>
                    <td className="mono">{h.method}</td>
                    <td>
                      <span className={`status ${h.ok ? 'status-active' : 'status-error'}`}>
                        {h.ok ? 'ok' : 'erro'}
                      </span>
                    </td>
                    <td>{h.message}</td>
                    <td>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => setResponseText(JSON.stringify(h.response, null, 2))}
                      >
                        Ver
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </>
  )
}
