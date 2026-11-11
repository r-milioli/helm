/** Catálogo completo dos endpoints da API local ixBrowser v2. */
export type EndpointCategory =
  | 'profile'
  | 'proxy'
  | 'tag'
  | 'group'
  | 'gateway'
  | 'fingerprint'
  | 'transfer'
  | 'other'

export interface EndpointDef {
  method: string
  category: EndpointCategory
  label: string
  description: string
  sampleBody?: Record<string, unknown>
}

export const IX_ENDPOINTS: EndpointDef[] = [
  // Fingerprint
  {
    method: 'randomFingerprintConfiguration',
    category: 'fingerprint',
    label: 'Fingerprint aleatório',
    description: 'Gera configuração de fingerprint aleatória',
    sampleBody: {},
  },

  // Profiles
  { method: 'getProfileList', category: 'profile', label: 'Listar perfis', description: 'Lista todos os perfis', sampleBody: {} },
  {
    method: 'createProfile',
    category: 'profile',
    label: 'Criar perfil',
    description: 'Cria um novo perfil',
    sampleBody: { name: 'Novo perfil' },
  },
  {
    method: 'copyProfile',
    category: 'profile',
    label: 'Copiar perfil',
    description: 'Copia um perfil existente',
    sampleBody: { profile_id: 0, name: 'Cópia' },
  },
  {
    method: 'openProfile',
    category: 'profile',
    label: 'Abrir perfil',
    description: 'Abre o navegador do perfil',
    sampleBody: { profile_id: 0 },
  },
  { method: 'getOpenedProfile', category: 'profile', label: 'Perfis abertos', description: 'Lista perfis abertos', sampleBody: {} },
  {
    method: 'retrieveOpenedProfiles',
    category: 'profile',
    label: 'Perfis abertos via API',
    description: 'Lista perfis abertos pela API local',
    sampleBody: {},
  },
  {
    method: 'customizeProfileLayout',
    category: 'profile',
    label: 'Layout do perfil',
    description: 'Customiza layout de perfis abertos',
    sampleBody: { profile_id: 0 },
  },
  {
    method: 'resetBrowserOpenStatus',
    category: 'profile',
    label: 'Resetar status aberto',
    description: 'Reseta o status de abertura',
    sampleBody: {},
  },
  {
    method: 'openProfileWithRandomFingerprint',
    category: 'profile',
    label: 'Abrir com fingerprint aleatório',
    description: 'Abre perfil com fingerprint randomizado',
    sampleBody: { profile_id: 0 },
  },
  {
    method: 'closeProfile',
    category: 'profile',
    label: 'Fechar perfil',
    description: 'Fecha um perfil aberto',
    sampleBody: { profile_id: 0 },
  },
  {
    method: 'closeProfilesBatch',
    category: 'profile',
    label: 'Fechar em lote',
    description: 'Fecha vários perfis',
    sampleBody: { profile_id: [] },
  },
  {
    method: 'clearProfileCache',
    category: 'profile',
    label: 'Limpar cache',
    description: 'Limpa o cache do perfil',
    sampleBody: { profile_id: 0 },
  },
  {
    method: 'clearProfileCacheAndCookies',
    category: 'profile',
    label: 'Limpar cache e cookies',
    description: 'Limpa cache e cookies',
    sampleBody: { profile_id: 0 },
  },
  {
    method: 'clearSavedAccountAndPassword',
    category: 'profile',
    label: 'Limpar conta salva',
    description: 'Remove usuário/senha salvos no perfil',
    sampleBody: { profile_id: 0 },
  },
  {
    method: 'updateProfile',
    category: 'profile',
    label: 'Atualizar perfil',
    description: 'Atualiza configurações do perfil',
    sampleBody: { profile_id: 0, name: 'Nome atualizado' },
  },
  {
    method: 'updateProfileProxyResidential',
    category: 'profile',
    label: 'Proxy residencial no perfil',
    description: 'Atribui proxy residencial comprado',
    sampleBody: { profile_id: 0 },
  },
  {
    method: 'updateProfileProxyStatic',
    category: 'profile',
    label: 'Proxy estático no perfil',
    description: 'Atribui proxy estático comprado',
    sampleBody: { profile_id: 0 },
  },
  {
    method: 'updateProfileProxyCustom',
    category: 'profile',
    label: 'Proxy custom no perfil',
    description: 'Atribui proxy customizado ao perfil',
    sampleBody: {
      profile_id: 0,
      proxy_config: {
        proxy_mode: 2,
        proxy_type: 'socks5',
        proxy_ip: '127.0.0.1',
        proxy_port: '1080',
      },
    },
  },
  {
    method: 'updateProfileProxyAPI',
    category: 'profile',
    label: 'Proxy via API no perfil',
    description: 'Atribui proxy por extração de URL/API',
    sampleBody: { profile_id: 0 },
  },
  {
    method: 'updateProfileGroupsBatch',
    category: 'profile',
    label: 'Mover grupo em lote',
    description: 'Atualiza grupo de vários perfis',
    sampleBody: { profile_id: [], group_id: 0 },
  },
  {
    method: 'getProfileCookies',
    category: 'profile',
    label: 'Obter cookies',
    description: 'Lê cookies do perfil',
    sampleBody: { profile_id: 0 },
  },
  {
    method: 'updateProfileCookies',
    category: 'profile',
    label: 'Atualizar cookies',
    description: 'Grava cookies no perfil',
    sampleBody: { profile_id: 0, cookie: [] },
  },
  {
    method: 'deleteProfile',
    category: 'profile',
    label: 'Excluir perfil',
    description: 'Move perfil para a lixeira / exclui',
    sampleBody: { profile_id: [0] },
  },
  {
    method: 'emptyRecycleBin',
    category: 'profile',
    label: 'Esvaziar lixeira',
    description: 'Remove permanentemente perfis da lixeira',
    sampleBody: {},
  },

  // Transfer
  {
    method: 'createProfileTransferCode',
    category: 'transfer',
    label: 'Criar código de transferência',
    description: 'Gera código para transferir perfil',
    sampleBody: { profile_id: 0 },
  },
  {
    method: 'cancelProfileTransferCode',
    category: 'transfer',
    label: 'Cancelar transferência',
    description: 'Cancela código de transferência',
    sampleBody: { transfer_code: '' },
  },
  {
    method: 'importProfileViaTransferCode',
    category: 'transfer',
    label: 'Importar por código',
    description: 'Importa perfil via código',
    sampleBody: { transfer_code: '' },
  },
  {
    method: 'getProfileTransferRecordsList',
    category: 'transfer',
    label: 'Histórico de transferências',
    description: 'Lista registros de transferência',
    sampleBody: {},
  },

  // Proxies
  {
    method: 'getResidentialProxyList',
    category: 'proxy',
    label: 'Listar proxies residenciais',
    description: 'Lista proxies residenciais comprados',
    sampleBody: {},
  },
  { method: 'getProxyList', category: 'proxy', label: 'Listar proxies', description: 'Lista proxies configurados', sampleBody: {} },
  {
    method: 'createCustomProxy',
    category: 'proxy',
    label: 'Criar proxy custom',
    description: 'Cria proxy HTTP/HTTPS/SOCKS5 customizado',
    sampleBody: {
      proxy_type: 'socks5',
      proxy_ip: '127.0.0.1',
      proxy_port: '1080',
    },
  },
  {
    method: 'updateCustomProxy',
    category: 'proxy',
    label: 'Atualizar proxy custom',
    description: 'Atualiza proxy customizado',
    sampleBody: { proxy_id: 0 },
  },
  {
    method: 'deleteCustomProxy',
    category: 'proxy',
    label: 'Excluir proxy custom',
    description: 'Remove proxy customizado',
    sampleBody: { proxy_id: [0] },
  },
  { method: 'getProxyTag', category: 'proxy', label: 'Listar tags de proxy', description: 'Lista tags de proxy', sampleBody: {} },
  {
    method: 'createProxyTag',
    category: 'proxy',
    label: 'Criar tag de proxy',
    description: 'Cria tag para proxies',
    sampleBody: { name: 'Nova tag' },
  },
  {
    method: 'updateProxyTag',
    category: 'proxy',
    label: 'Atualizar tag de proxy',
    description: 'Atualiza tag de proxy',
    sampleBody: { id: 0, name: 'Tag' },
  },
  {
    method: 'deleteProxyTag',
    category: 'proxy',
    label: 'Excluir tag de proxy',
    description: 'Remove tag de proxy',
    sampleBody: { id: [0] },
  },

  // Gateway
  { method: 'getGatewayList', category: 'gateway', label: 'Listar gateways', description: 'Lista gateways de acesso', sampleBody: {} },
  {
    method: 'switchAccessGateway',
    category: 'gateway',
    label: 'Trocar gateway',
    description: 'Alterna o gateway ativo',
    sampleBody: { gateway_id: 0 },
  },

  // Tags
  { method: 'getTag', category: 'tag', label: 'Listar tags', description: 'Lista tags de perfil', sampleBody: {} },
  {
    method: 'createTag',
    category: 'tag',
    label: 'Criar tag',
    description: 'Cria tag de perfil',
    sampleBody: { name: 'Nova tag' },
  },
  {
    method: 'updateTag',
    category: 'tag',
    label: 'Atualizar tag',
    description: 'Atualiza tag de perfil',
    sampleBody: { id: 0, name: 'Tag' },
  },
  {
    method: 'deleteTag',
    category: 'tag',
    label: 'Excluir tag',
    description: 'Remove tag de perfil',
    sampleBody: { id: [0] },
  },

  // Groups
  { method: 'getGroup', category: 'group', label: 'Listar grupos', description: 'Lista grupos de perfil', sampleBody: {} },
  {
    method: 'createGroup',
    category: 'group',
    label: 'Criar grupo',
    description: 'Cria grupo de perfis',
    sampleBody: { name: 'Novo grupo' },
  },
  {
    method: 'updateGroup',
    category: 'group',
    label: 'Atualizar grupo',
    description: 'Atualiza grupo',
    sampleBody: { id: 0, name: 'Grupo' },
  },
  {
    method: 'deleteGroup',
    category: 'group',
    label: 'Excluir grupo',
    description: 'Remove grupo',
    sampleBody: { id: [0] },
  },
]

export const ENDPOINT_METHODS = IX_ENDPOINTS.map((e) => e.method)
