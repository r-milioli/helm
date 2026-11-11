import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { AppProvider } from './context/AppContext'
import { AccountsPage } from './pages/AccountsPage'
import { AdvancedPage } from './pages/AdvancedPage'
import { ClientsPage } from './pages/ClientsPage'
import { GroupsTagsPage } from './pages/GroupsTagsPage'
import { OverviewPage } from './pages/OverviewPage'
import { ProfilesPage } from './pages/ProfilesPage'
import { ProxiesPage } from './pages/ProxiesPage'
import { SettingsPage } from './pages/SettingsPage'

export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<OverviewPage />} />
            <Route path="clientes" element={<ClientsPage />} />
            <Route path="contas" element={<AccountsPage />} />
            <Route path="perfis" element={<ProfilesPage />} />
            <Route path="grupos-tags" element={<GroupsTagsPage />} />
            <Route path="proxies" element={<ProxiesPage />} />
            <Route path="avancado" element={<AdvancedPage />} />
            <Route path="configuracoes" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </HashRouter>
    </AppProvider>
  )
}
