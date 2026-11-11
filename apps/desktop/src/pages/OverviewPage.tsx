import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { asList, helm } from '../lib/helm'
import type { Account, Client } from '../lib/types'

export function OverviewPage() {
  const { connection, toast } = useApp()
  const [clients, setClients] = useState<Client[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [profiles, setProfiles] = useState<any[]>([])
  const [opened, setOpened] = useState<any[]>([])
  const [proxies, setProxies] = useState<any[]>([])

  useEffect(() => {
    ;(async () => {
      try {
        const [c, a] = await Promise.all([helm().db.listClients(), helm().db.listAccounts()])
        setClients(c)
        setAccounts(a)
        if (connection?.ok) {
          const [p, o, px] = await Promise.all([
            helm().api.call('getProfileList', {}),
            helm().api.call('getOpenedProfile', {}),
            helm().api.call('getProxyList', {}),
          ])
          setProfiles(asList(p.data))
          setOpened(asList(o.data))
          setProxies(asList(px.data))
        }
      } catch (err) {
        toast('Erro ao carregar visão geral', String(err), 'error')
      }
    })()
  }, [connection?.ok, toast])

  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <>
      <div className="page-head">
        <div>
          <div className="eyebrow">{today}</div>
          <h1>Visão geral</h1>
          <p>Acompanhe clientes Helm e a operação dos perfis do ixBrowser.</p>
        </div>
        <div className="actions">
          <Link className="btn btn-secondary" to="/avancado">
            API avançada
          </Link>
          <Link className="btn btn-primary" to="/clientes">
            Adicionar cliente
          </Link>
        </div>
      </div>

      <section className="stats">
        <article className="stat-card">
          <div className="stat-top">Clientes</div>
          <div className="stat-value">{clients.length}</div>
          <div className="stat-foot">Cadastro local Helm</div>
        </article>
        <article className="stat-card">
          <div className="stat-top">Contas</div>
          <div className="stat-value">{accounts.length}</div>
          <div className="stat-foot">
            {accounts.filter((a) => a.ix_profile_id).length} vinculadas a perfis
          </div>
        </article>
        <article className="stat-card">
          <div className="stat-top">Perfis ixBrowser</div>
          <div className="stat-value">{profiles.length}</div>
          <div className="stat-foot">
            {opened.length} abertos agora
          </div>
        </article>
        <article className="stat-card">
          <div className="stat-top">Proxies</div>
          <div className="stat-value">{proxies.length}</div>
          <div className="stat-foot">
            {connection?.ok ? 'API respondendo' : 'API offline'}
          </div>
        </article>
      </section>

      <div className="grid-2">
        <section className="panel">
          <div className="panel-head">
            <div>
              <h2 className="panel-title">Conexão</h2>
              <p className="panel-sub">Estado da API local</p>
            </div>
          </div>
          <p>
            <strong>{connection?.ok ? 'Online' : 'Offline'}</strong>
          </p>
          <p className="muted">{connection?.message}</p>
          {connection?.url ? <p className="mono muted">{connection.url}</p> : null}
          {connection?.latencyMs ? (
            <p className="muted">Latência: {connection.latencyMs} ms</p>
          ) : null}
        </section>

        <section className="panel">
          <div className="panel-head">
            <div>
              <h2 className="panel-title">Contas recentes</h2>
              <p className="panel-sub">Últimas contas cadastradas no Helm</p>
            </div>
            <Link className="btn btn-ghost btn-sm" to="/contas">
              Ver todas
            </Link>
          </div>
          {accounts.length === 0 ? (
            <div className="empty">Nenhuma conta ainda. Cadastre um cliente e uma conta.</div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Usuário</th>
                    <th>Plataforma</th>
                    <th>Perfil ix</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.slice(0, 6).map((a) => (
                    <tr key={a.id}>
                      <td>{a.username}</td>
                      <td>{a.platform || '—'}</td>
                      <td className="mono">{a.ix_profile_id || '—'}</td>
                      <td>
                        <span className="status status-active">{a.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </>
  )
}
