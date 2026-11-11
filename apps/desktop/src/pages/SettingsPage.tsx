import { useEffect, useState } from 'react'
import { useApp } from '../context/AppContext'
import { helm } from '../lib/helm'

export function SettingsPage() {
  const { toast, refreshConnection, settings, reloadSettings, theme, setTheme } = useApp()
  const [host, setHost] = useState('127.0.0.1')
  const [port, setPort] = useState('53200')
  const [basePath, setBasePath] = useState('/api/v2')
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [version, setVersion] = useState('')

  useEffect(() => {
    setHost(settings.host || '127.0.0.1')
    setPort(settings.port || '53200')
    setBasePath(settings.basePath || '/api/v2')
  }, [settings])

  useEffect(() => {
    helm()
      .app.getVersion()
      .then(setVersion)
      .catch(() => setVersion('dev'))
  }, [])

  async function save() {
    setSaving(true)
    try {
      await helm().api.setConfig({
        host,
        port: Number(port),
        basePath,
      })
      await helm().db.setSettings({
        host,
        port: String(port),
        basePath,
        language: 'pt-BR',
      })
      await reloadSettings()
      toast('Configurações salvas', `${host}:${port}${basePath}`)
    } catch (err) {
      toast('Erro ao salvar', String(err), 'error')
    } finally {
      setSaving(false)
    }
  }

  async function test() {
    setTesting(true)
    try {
      await helm().api.setConfig({
        host,
        port: Number(port),
        basePath,
      })
      const result = await refreshConnection()
      toast(
        result.ok ? 'Conexão OK' : 'Falha na conexão',
        result.message,
        result.ok ? 'success' : 'error',
      )
      if (result.ok && result.basePath !== undefined) {
        setBasePath(result.basePath === '/' ? '' : result.basePath)
      }
    } finally {
      setTesting(false)
    }
  }

  return (
    <>
      <div className="page-head">
        <div>
          <div className="eyebrow">Preferências</div>
          <h1>Configurações</h1>
          <p>Conexão com a API local do ixBrowser, tema e idioma.</p>
        </div>
        <div className="actions">
          <button className="btn btn-secondary" onClick={test} disabled={testing}>
            {testing ? 'Testando...' : 'Testar conexão'}
          </button>
          <button className="btn btn-primary" onClick={save} disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>

      <section className="panel">
        <div className="panel-head">
          <div>
            <h2 className="panel-title">API ixBrowser</h2>
            <p className="panel-sub">Default: http://127.0.0.1:53200/api/v2</p>
          </div>
        </div>
        <div className="form-grid">
          <div className="form-field">
            <label>Host</label>
            <input className="field" value={host} onChange={(e) => setHost(e.target.value)} />
          </div>
          <div className="form-field">
            <label>Porta</label>
            <input className="field" value={port} onChange={(e) => setPort(e.target.value)} />
          </div>
          <div className="form-field full">
            <label>Base path</label>
            <input
              className="field"
              value={basePath}
              onChange={(e) => setBasePath(e.target.value)}
              placeholder="/api/v2"
            />
            <p className="muted" style={{ margin: '6px 0 0' }}>
              No teste de conexão, o Helm tenta `/api/v2` e a raiz se a rota configurada falhar.
            </p>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-head">
          <div>
            <h2 className="panel-title">Aparência</h2>
            <p className="panel-sub">Tema e idioma do aplicativo</p>
          </div>
        </div>
        <div className="form-grid">
          <div className="form-field">
            <label>Tema</label>
            <select
              className="field"
              value={theme}
              onChange={(e) => setTheme(e.target.value as 'light' | 'dark')}
            >
              <option value="light">Claro</option>
              <option value="dark">Escuro</option>
            </select>
          </div>
          <div className="form-field">
            <label>Idioma</label>
            <input className="field" value="Português (Brasil)" disabled />
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-head">
          <div>
            <h2 className="panel-title">Sobre</h2>
            <p className="panel-sub">Helm desktop fase 1</p>
          </div>
        </div>
        <p className="muted">Versão: {version || '—'}</p>
        <p className="muted">
          Banco local (JSON em userData, schema híbrido da fase 1). Sem cofre de senhas nesta fase.
        </p>
      </section>
    </>
  )
}
