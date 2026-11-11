# @helm/ixbrowser-api

O cliente tipado da API local do ixBrowser vive em:

`apps/desktop/electron/ixbrowser/`

Inclui:

- catálogo completo de endpoints (`endpoints.ts`)
- fila com concorrência máxima 3 (`queue.ts`)
- cliente HTTP + health-check com fallback de basePath (`client.ts`)
