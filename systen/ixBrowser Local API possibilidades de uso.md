# ixBrowser Local API: possibilidades de uso

> **Aviso importante:** a página oficial da documentação carrega o conteúdo por script e não pôde ser lida automaticamente. Este documento foi montado a partir do cliente oficial em Python (ixspyinc/ixbrowser-local-api-python), do README do pacote e de artigos de terceiros. Os nomes exatos de rotas, parâmetros e campos devem ser conferidos em https://www.ixbrowser.com/doc/v2/local-api/en antes de implementar.

## 1. Visão geral

- A API do ixBrowser é uma **API HTTP local**: roda no seu computador, com o aplicativo ixBrowser aberto. Não é uma API na nuvem.
- Serve para ler e gravar a configuração dos perfis, abrir e fechar navegadores, consultar contas e outras interfaces básicas.
- Integra com **Selenium, Puppeteer e Playwright** para automatizar a navegação.
- Existe um cliente oficial em Python (`ixbrowser-local-api`, classe `IXBrowserClient`) que encapsula os mesmos endpoints.

## 2. O que é possível fazer

### 2.1 Perfis

- **Listar perfis** (`get_profile_list`): retorna os perfis existentes, cada um com seu `profile_id`.
- **Criar perfil**: com proxy, preferências e configurações de fingerprint (exemplo oficial `profile_create.py`).
- **Atualizar perfil**: alterar proxy, fingerprint e demais configurações (`profile_update.py`).
- **Copiar perfil**: criar um perfil novo a partir de outro (`profile_copy.py`).
- **Excluir perfil**: remoção programática de perfis.
- **Abrir perfil** (`open_profile`): inicia o navegador do perfil. O retorno traz os campos `webdriver` e `debugging_address`.
- **Abrir com fingerprint aleatório**: abre o perfil gerando uma impressão digital randomizada (`profile_open_with_random_fingerprint.py`).
- **Fechar perfil**: encerra o navegador aberto.
- **Backup de cookies e página de informações**: o `open_profile` aceita opções como `cookies_backup` e `load_profile_info_page`.

### 2.2 Grupos e tags

- **Grupos**: criar, listar, editar e excluir grupos para organizar perfis.
- **Tags de perfil**: CRUD completo (exemplos em `examples/tag/`).
- **Tags de proxy**: CRUD completo (exemplos em `examples/proxy_tag/`).

### 2.3 Cookies

- Ler e gravar cookies dos perfis, útil para migrar ou restaurar sessões.

### 2.4 Proxies

- Configurar proxy por perfil (HTTP, HTTPS, SOCKS5) e organizar proxies com tags.

### 2.5 Fingerprint

- Gerar fingerprints e aplicá-los na criação ou atualização de perfis.

### 2.6 Transferência de perfis

- **Códigos de transferência** (`examples/profile_transfer_code/`): permitem passar perfis entre contas ou membros da equipe.

### 2.7 Informações locais

- Consultar informações do cliente local e listar recursos disponíveis (`show_info.py`).

## 3. Automação de navegador

Depois de `open_profile`, o retorno inclui:

- `webdriver`: caminho do driver para uso com **Selenium**.
- `debugging_address`: endereço de depuração (CDP) para conectar **Puppeteer** ou **Playwright**.

Fluxo típico: listar perfis, abrir um, conectar a ferramenta de automação, executar as ações e fechar o perfil.

## 4. Ideias do que construir

1. **Painel próprio de gestão de contas**: criar, agrupar e abrir perfis em lote a partir de uma interface sua.
2. **Provisionamento em massa**: criar centenas de perfis com proxy e fingerprint únicos a partir de uma planilha.
3. **Rotinas agendadas**: abrir perfis em horários definidos para tarefas recorrentes.
4. **Scripts de automação**: preenchimento de formulários, coleta de dados e testes com Selenium ou Playwright.
5. **Migração e backup de sessões**: exportar e importar cookies entre perfis.
6. **Gestão de equipe**: distribuir perfis por transferência de código e organizar por tags.
7. **Integração com seus produtos**: ferramentas como Smart Showcase ou Provision podem chamar a API local para orquestrar perfis.

## 5. Limitações e cuidados

- Como a API é local, o app precisa estar aberto e a automação roda na máquina do usuário.
- Há limites no plano gratuito, como teto diário de criação de perfis e de aberturas, segundo comparativos de terceiros. Confira o que vale para o seu plano.
- Respeite os termos de uso das plataformas onde as contas operam.

## 6. Referências

- Documentação oficial: https://www.ixbrowser.com/doc/v2/local-api/en?target_id=e40f5b74-d87d-47f3-92d6-3e3f0c59947b
- Cliente Python oficial: https://github.com/ixspyinc/ixbrowser-local-api-python
- Pacote no PyPI: ixbrowser-local-api
