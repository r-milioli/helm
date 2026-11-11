# PRD - Helm

**Produto:** Helm, gestor desktop de contas e perfis de clientes integrado ao ixBrowser **Versão do documento:** 1.0 (rascunho para revisão da equipe) **Data:** 09/11/2026 **Responsável:** Robson

## 1. Visão geral

O Helm é um aplicativo desktop para Windows que se conecta à API local do ixBrowser e centraliza a operação de uma agência que gerencia perfis e páginas de clientes reais. Ele substitui a planilha do Google e o lançamento manual no ixBrowser por um único painel: cadastro de clientes e contas, criação e organização de perfis, controle de proxies, tags e grupos, cofre de credenciais e apoio de IA para planejamento de conteúdo.

> **Nota sobre o escopo:** este PRD cobre apenas a gestão operacional de contas de clientes que autorizaram o serviço.

## 2. Problema

- Os dados das contas ficam em planilha do Google e são passados à mão para o ixBrowser, o que gera retrabalho e erro.
- Não há histórico confiável de quem mexeu em qual conta, nem controle do estado de cada uma.
- Senhas e dados sensíveis ficam expostos em planilha compartilhada.
- Criar, agrupar, abrir e fechar perfis em volume exige muitos cliques repetitivos.


## 3. Objetivos e não objetivos

### Objetivos da v1

1. Substituir a planilha por um cadastro estruturado de clientes, contas e perfis.
2. Operar o ixBrowser inteiro pelo Helm (CRUD de perfis, grupos, tags, proxies, abrir e fechar).
3. Guardar credenciais em um cofre local criptografado.
4. Dar apoio de IA para persona de marketing e sugestões de conteúdo da empresa do cliente.
5. Deixar a arquitetura pronta para a v2, com sistema web e autenticação de permissões. 

### Não objetivos da v1

- Integração oficial com a API do Facebook ou de outras redes.
- Versões para macOS, Linux ou mobile.
- Painel web e multiusuário em nuvem (fica para a v2).


## 4. Princípios de conformidade e fora do escopo

O Helm é uma ferramenta de **gestão de contas reais de clientes**. Por isso:

- Toda conta ou página cadastrada pertence a um cliente real, vinculado a um registro.
- Os dados de verificação (telefone, e-mail, documentos) devem ser do próprio cliente.

## 5. Usuários

| Perfil | Descrição | Fase |
| --- | --- | --- |
| Operador (Admin) | Quem usa o app no dia a dia: cadastra clientes, cria e abre perfis, usa a IA. Na v1 é um único usuário local com senha-mestra. | v1 |
| Gestor | Supervisiona a equipe, vê relatórios e gerencia permissões. | v2 |
| Operador de equipe | Acessa apenas os clientes e grupos liberados para ele. | v2 |

A v1 já modela os papéis internamente (admin e operador) para que a v2 só precise ligar a autenticação do sistema web.

## 6. Requisitos funcionais

### 6.1 Clientes e autorização

- **RF-01** Cadastrar cliente com nome, empresa, contato, observações e status (ativo, pausado, encerrado).
- **RF-02** Registrar a autorização do cliente: data, escopo do serviço e validade.
- **RF-03** Permitir revogar a autorização, marcando as contas do cliente como "pendentes de devolução ou encerramento".
- **RF-04** 

### 6.2 Contas gerenciadas

- **RF-05** Cadastrar conta existente (conectar) ou registrar uma conta nova a ser criada para o cliente.
- **RF-06** Campos: plataforma, nome de usuário, e-mail, telefone do cliente, senha (no cofre), cliente vinculado, perfil do ixBrowser vinculado, proxy, observações e campos opcionais personalizados.
- **RF-07** Status de ciclo de vida da conta: pendente de criação, aguardando dados do cliente, ativa, em revisão, restrita, suspensa e encerrada.
- **RF-08** Tags livres e coloridas, além do status, para o operador classificar como quiser (por exemplo, por serviço contratado).
- **RF-09** Histórico de alterações de cada conta, com data e autor.
- **RF-10** Busca, filtros e visualização em tabela por cliente, status, tag, grupo e proxy.

### 6.3 Perfis do ixBrowser (CRUD completo)

- **RF-11** Listar, criar, editar, copiar e excluir perfis do ixBrowser pelo Helm, com sincronização bidirecional dos dados.
- **RF-12** Abrir e fechar perfis individualmente ou em lote, mostrando o estado atual (aberto, fechado, erro).
- **RF-13** Criar perfil a partir de um modelo (proxy, preferências e fingerprint padrão), vinculando-o a uma conta do Helm.
- **RF-14** Exportar e importar cookies de um perfil para backup e restauração de sessão do próprio cliente.
- **RF-15** Detectar perfis do ixBrowser que não estão vinculados a nenhuma conta do Helm e oferecer a importação.

### 6.4 Grupos, tags e proxies

- **RF-16** CRUD de grupos de perfis, refletido no ixBrowser.
- **RF-17** CRUD de tags de perfil e de proxy, refletido no ixBrowser.
- **RF-18** Cadastro de proxies (HTTP, HTTPS, SOCKS5) com teste de conexão, e atribuição por perfil ou em lote.
- **RF-19** Alerta quando um proxy falhar ou estiver compartilhado por mais perfis do que o limite definido pelo operador.

### 6.5 Cofre de credenciais

- **RF-20** Senhas e dados sensíveis ficam em banco local criptografado (AES-256), protegido por senha-mestra do operador.
- **RF-21** As senhas ficam mascaradas na tela; revelar ou copiar exige a senha-mestra e gera registro de auditoria.
- **RF-22** Bloqueio automático do cofre por inatividade, com tempo configurável.
- **RF-23** Backup criptografado do banco, com exportação e restauração manual.

### 6.6 Importação da planilha atual

- **RF-24** Importar CSV ou planilha exportada do Google Sheets, com mapeamento de colunas para os campos do Helm.
- **RF-25** Pré-visualização com validação (duplicados, campos obrigatórios, cliente sem autorização) antes de confirmar.
- **RF-26** Opcional: criar os perfis no ixBrowser automaticamente após a importação, em lote.

### 6.7 IA para marketing (OpenAI e OpenRouter)

- **RF-27** Configurar chaves próprias (BYOK) de OpenAI e OpenRouter, guardadas no cofre, com escolha de modelo.
- **RF-28** **Persona de marketing do cliente:** com um clique, a IA gera o público-alvo e a persona de comprador da empresa do cliente (perfil demográfico, dores, desejos, objeções, canais e linguagem), a partir do briefing do negócio.
- **RF-29** Cada persona de marketing fica em página própria, vinculada ao cliente, editável e versionada.
- **RF-30** Sugestão de calendário de conteúdo, ideias de posts, roteiros e textos de anúncio alinhados à persona. O operador revisa e publica manualmente.
- **RF-31** Registro de consumo de tokens e custo estimado por cliente.

> A persona aqui é uma ferramenta de planejamento sobre o público do cliente.

### 6.8 Operações em lote e agendamento

- **RF-32** Ações em lote: criar, abrir, fechar, atribuir proxy, aplicar tag e mover de grupo vários perfis de uma vez, com fila e indicador de progresso.
- **RF-33** Limite configurável de perfis abertos ao mesmo tempo, para não sobrecarregar a máquina.
- **RF-34** Agendar tarefas operacionais do próprio Helm, como backup do cofre, teste de proxies e verificação de perfis.
- **RF-35** O operador pode abrir um perfil e atuar manualmente nele pelo navegador do ixBrowser. O Helm não executa ações dentro das redes sociais.

### 6.9 Auditoria e relatórios

- **RF-36** Log de auditoria imutável de todas as ações: quem, quando, o quê, em qual cliente e conta.
- **RF-37** Painel inicial com totais por status, proxies com problema e perfis abertos.
- **RF-38** Exportação de relatórios por cliente em CSV e PDF.

### 6.10 Configurações

- **RF-39** Conexão com o ixBrowser: endereço e porta da API local, teste de conexão e aviso quando o app do ixBrowser estiver fechado.
- **RF-40** Preferências de idioma (português por padrão), tema, tempo de bloqueio do cofre e pasta de backup.

## 7. Requisitos não funcionais

| Categoria | Requisito |
| --- | --- |
| Plataforma | Windows 10 e 11, 64 bits. |
| Segurança | Criptografia AES-256 em repouso; chave derivada da senha-mestra (Argon2 ou scrypt); nenhum dado sensível em log ou em texto simples. |
| Privacidade | Dados de clientes ficam apenas na máquina do operador na v1; conformidade com a LGPD (base legal, finalidade e exclusão a pedido do cliente). |
| Desempenho | Listar 5.000 contas em menos de 2 segundos; abertura de perfil limitada apenas pelo ixBrowser. |
| Confiabilidade | Se o ixBrowser estiver fechado ou a API falhar, o app continua funcional em modo leitura e reenvia a fila quando reconectar. |
| Usabilidade | Interface em português, atalhos de teclado, ações em lote com seleção múltipla. |
| Manutenibilidade | Camada de integração isolada, para trocar o ixBrowser por outro multilogin no futuro. |
| Atualização | Atualização automática do app com verificação de assinatura. |

## 8. Arquitetura e stack

- **Aplicativo:** Electron com TypeScript e interface em React.
- **Banco de dados:** SQLite local com criptografia (SQLCipher ou equivalente).
- **Integração ixBrowser:** módulo próprio que consome a API HTTP local, com tratamento de erros, tentativas e fila.
- **IA:** módulo de provedores com interface única para OpenAI e OpenRouter, usando as chaves do operador.
- **Preparo para a v2:** camada de serviços desacoplada da interface, entidades com identificador global (UUID) e campos de proprietário e papel, para sincronizar com um sistema web depois.

## 9. Modelo de dados (entidades principais)

| Entidade | Campos principais |
| --- | --- |
| Cliente | id, nome, empresa, contato, status, observações |
| Autorização | id, cliente, escopo, data, validade, comprovação, status |
| Conta | id, cliente, plataforma, usuário, e-mail, telefone, status, perfil\_ixbrowser\_id, proxy, tags |
| Credencial (cofre) | id, conta, segredo criptografado, atualizado\_em |
| Perfil ixBrowser | id local, profile\_id do ixBrowser, grupo, tags, último estado |
| Grupo e Tag | id, nome, cor, tipo (perfil ou proxy) |
| Proxy | id, tipo, host, porta, usuário, status, último teste |
| Persona de marketing | id, cliente, versão, público-alvo, dores, desejos, canais, tom de voz |
| Conteúdo sugerido | id, persona, tipo, texto, status (rascunho, aprovado, publicado manualmente) |
| Tarefa em lote | id, tipo, itens, progresso, resultado |
| Log de auditoria | id, data, usuário, ação, entidade, detalhes |
| Usuário e papel | id, nome, papel (admin ou operador) |

## 10. Fluxos principais

### 10.1 Novo cliente com conta existente

1. Cadastrar cliente e registrar a autorização.
2. Cadastrar a conta existente e guardar a senha no cofre.
3. Criar o perfil no ixBrowser a partir de um modelo, com proxy atribuído.
4. Vincular perfil e conta, aplicar tags e grupo.
5. Abrir o perfil para o operador conferir o acesso.

### 10.2 Novo cliente sem conta ou página

1. Cadastrar cliente, registrar a autorização e marcar a conta como "pendente de criação".
2. Coletar os dados reais do cliente (nome, e-mail, telefone dele para verificação) e mudar para "aguardando dados do cliente".
3. Criar o perfil no ixBrowser e abrir para o operador concluir o cadastro manualmente na plataforma, com os dados do cliente.
4. Marcar a conta como "ativa" e guardar as credenciais no cofre.

### 10.3 Migração da planilha

1. Importar o CSV e mapear as colunas.
2. Revisar a validação e corrigir pendências.
3. Confirmar a importação e, se quiser, criar os perfis em lote.

### 10.4 Planejamento de conteúdo

1. Preencher o briefing do negócio do cliente.
2. Gerar a persona de marketing com um clique e ajustar.
3. Gerar o calendário e as ideias de conteúdo.
4. Aprovar e publicar manualmente, fora do Helm.

## 11. Dependências e pontos a confirmar no ixBrowser

A documentação oficial da API local do ixBrowser não pôde ser lida automaticamente. Antes do desenvolvimento, a equipe deve confirmar:

- Lista exata de endpoints, parâmetros e códigos de erro (perfis, grupos, tags, proxies, cookies).
- Limites do plano contratado (número de perfis, aberturas por dia, uso da API).
- Comportamento da API com o app fechado e porta padrão.
- Se existe evento ou webhook de mudança de estado, ou se será preciso consultar periodicamente.
- Termos de uso do ixBrowser para uso da API em um produto da agência.

## 12. Roadmap

| Versão | Entregas |
| --- | --- |
| **v1.0 (MVP)** | Clientes e autorização, contas, cofre, CRUD de perfis, grupos, tags e proxies, importação da planilha, auditoria, ações em lote. |
| **v1.1** | IA de marketing (persona do cliente e sugestões de conteúdo), relatórios por cliente, backup agendado. |
| **v2.0** | Sistema web, login e permissões por papel, sincronização com o app desktop, equipe multiusuário. |
| **v2.x** | Portal do cliente para acompanhar status e aprovar conteúdo. |

## 13. Métricas de sucesso

- Redução do tempo para cadastrar e deixar uma conta pronta no ixBrowser (meta: de manual para menos de 3 minutos por conta).
- 100% das contas ativas com cliente e autorização válida vinculados.
- Zero senhas fora do cofre após a migração da planilha.
- Taxa de sucesso das operações em lote acima de 98%.
- Redução de erros de digitação e duplicidade em relatórios de auditoria.

## 14. Riscos

| Risco | Impacto | Mitigação |
| --- | --- | --- |
| Mudança ou limitação na API do ixBrowser | Alto | Camada de integração isolada e acompanhamento das versões da API. |
| Vazamento do banco local | Alto | Criptografia, senha-mestra, bloqueio por inatividade e backup criptografado. |
| Suspensão de contas pelas plataformas | Médio | Uso apenas de contas reais autorizadas, dados verdadeiros do cliente. |
| Cliente contestar a autorização | Médio | Registro de autorização com comprovação, validade e trilha de auditoria. |
| LGPD e tratamento de dados de terceiros | Alto | Base legal documentada, exclusão a pedido, mínimo de dados necessários. |

## 15. Perguntas em aberto

1. Qual plano do ixBrowser a agência usa e quais são os limites dele?
2. Os clientes assinam algum contrato ou termo hoje? O modelo de autorização do RF-02 precisa de um texto jurídico padrão.
3. Quais plataformas além do Facebook entram no cadastro de contas (Instagram, TikTok, Google)?
4. Quantas contas e clientes o app precisa suportar nos primeiros 12 meses?
5. O backup do cofre ficará só local ou terá opção de nuvem criptografada?



## API Local endereço web https://www.ixbrowser.com/doc/v2/local-api/en?target_id=e40f5b74-d87d-47f3-92d6-3e3f0c59947b