import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useApp } from '../../context/AppContext'

const workspaceLinks = [
  { to: '/', label: 'Visão geral', end: true },
  { to: '/clientes', label: 'Clientes' },
  { to: '/contas', label: 'Contas' },
  { to: '/perfis', label: 'Perfis' },
  { to: '/grupos-tags', label: 'Grupos e tags' },
  { to: '/proxies', label: 'Proxies' },
]

const managementLinks = [
  { to: '/avancado', label: 'Avançado' },
  { to: '/configuracoes', label: 'Configurações' },
]

const titles: Record<string, string> = {
  '/': 'Visão geral',
  '/clientes': 'Clientes',
  '/contas': 'Contas',
  '/perfis': 'Perfis',
  '/grupos-tags': 'Grupos e tags',
  '/proxies': 'Proxies',
  '/avancado': 'Avançado',
  '/configuracoes': 'Configurações',
}

export function AppShell() {
  const { connection, theme, setTheme, toasts, dismissToast, refreshConnection, refreshing } =
    useApp()
  const location = useLocation()
  const title = titles[location.pathname] ?? 'Helm'

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">H</div>
          <div>
            <div className="brand-name">helm</div>
            <div className="brand-sub">workspace</div>
          </div>
        </div>

        <div className="nav-label">Workspace</div>
        <nav className="nav">
          {workspaceLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="nav-label">Sistema</div>
        <nav className="nav">
          {managementLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="connection">
            <div className="connection-head">
              <span className={`connection-dot ${connection?.ok ? '' : 'off'}`} />
              {connection?.ok ? 'ixBrowser conectado' : 'ixBrowser offline'}
            </div>
            <p>{connection?.message ?? 'Verificando API local...'}</p>
          </div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="crumb">
            Workspace <span style={{ color: 'var(--subtle)' }}>/</span> <strong>{title}</strong>
          </div>
          <div className="top-actions">
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => refreshConnection()}
              disabled={refreshing}
            >
              {refreshing ? 'Testando...' : 'Testar conexão'}
            </button>
            <button
              className="icon-btn"
              title="Alternar tema"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? '☀' : '☾'}
            </button>
          </div>
        </header>
        <div className="content">
          <Outlet />
        </div>
      </main>

      <div className="toast-stack">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.type === 'success' ? '' : t.type}`}>
            <div>
              <strong>{t.title}</strong>
              <small>{t.message}</small>
            </div>
            <button className="icon-btn" style={{ marginLeft: 'auto' }} onClick={() => dismissToast(t.id)}>
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
