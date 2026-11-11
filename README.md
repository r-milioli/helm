# Helm

Aplicativo desktop Windows para gestão de clientes, contas e perfis do **ixBrowser**.

## Fase 1

Console operacional do ixBrowser (API local) + cadastro mínimo de clientes/contas com vínculo a perfis.

### Stack

- Electron + React + TypeScript (Vite)
- Persistência local JSON (schema híbrido: settings, clients, accounts, job_queue)
- API HTTP local do ixBrowser (`127.0.0.1:53200`)

### Como rodar

```bash
cd apps/desktop
npm install
npm run dev
```

Pré-requisito: ixBrowser aberto, com API local habilitada.

### Estrutura

- `apps/desktop` — aplicativo Electron
- `systen/` — PRD e design system de referência
- `img/` — assets da marca
