# XY Tools (SaaS Free, barato e escalável)

Este projeto é um web-app estático (HTML/CSS/JS) com ferramentas para operação de seller (margem, etiquetas e análises).
Ele funciona **sem backend** (tudo no navegador) e agora vem com **PWA + cache offline**.

## Como publicar de graça (recomendado)
### Opção A — Cloudflare Pages (grátis)
1. Crie um repositório (GitHub).
2. Suba a pasta `xy-tools/` (este projeto).
3. Conecte no Cloudflare Pages e faça deploy como **site estático** (sem build).

### Opção B — GitHub Pages (grátis)
1. Suba o projeto para um repo.
2. Ative Settings → Pages → branch `main` / root.
3. Acesse a URL gerada.

> Importante: PWA (service worker) precisa de HTTPS (Cloudflare/GitHub Pages já entregam).

## Estrutura
- `index.html` — home
- `pages/` — páginas de conteúdo
- `pages/tools/` — ferramentas
- `css/` e `js/` — estilos e scripts
- `manifest.json`, `sw.js` e `offline.html` — PWA

## Próximo passo para virar SaaS (quando você quiser)
- Auth real + banco (barato): Supabase (free tier) ou Firebase
- Salvar presets/histórico por usuário
- Relatório semanal por e-mail (Cloudflare Workers / Supabase Edge Functions)

