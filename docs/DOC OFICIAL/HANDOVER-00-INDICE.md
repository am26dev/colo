# Handover Colo Angola — Índice de Leitura

> **Para:** novo programador da equipa.
> **De:** equipa de desenvolvimento (docs geradas a partir do estado real do repositório).
> **Data:** 2026-08-28 · **Veredicto actual:** 🟢 **EM PRODUÇÃO** — `colo.ao` responde 200; alterações desta sessão ainda aguardam commit/deploy.

Este é o ponto de entrada das pastas do projecto. Os documentos com prefixo `HANDOVER-` foram criados para te dar o contexto completo de forma autónoma, sem depender de nenhum outro programador. O projecto não tem `docs/` canónicos próprios — o estado vivo vive no wiki (`CEREBRO DO CLAUDE/wiki/projetos/colo/`) e este pack é o resumo consolidado.

## Onde estão as pastas

```
/home/jairo-buto/EMPRESA/colo/
├── apps/
│   ├── api/        → Backend (Express 5 + Prisma 6 + SQLite) — porta 3004 em produção
│   └── web/        → Frontend (Vite 8 + React 19 + react-router 7) — SPA servida por nginx
├── docker/         → Dockerfiles de produção (api.Dockerfile, web.Dockerfile, nginx-web.conf)
├── .github/workflows/deploy.yml  → CI/CD: deploy automático em push a `main`
├── compose.yaml    → Orquestração de produção (2 serviços, rede `edge`, zero portas publicadas)
├── GUIA-PAINEL.md  → Guia de uso do painel /gestao (para a dona, linguagem de negócio)
├── README.md       → Arranque rápido actualizado
└── AGENTS.md       → ⚠️ NÃO EXISTE ainda neste projecto (ver regras de ouro)
```

## Ordem de leitura recomendada

| # | Documento | O que responde |
|---|---|---|
| 1 | [HANDOVER-01-O-PROJECTO.md](HANDOVER-01-O-PROJECTO.md) | O que é este produto, quem o usa, como ganha dinheiro, que decisões já foram tomadas |
| 2 | [HANDOVER-02-CONSTITUICAO.md](HANDOVER-02-CONSTITUICAO.md) | Como o código está organizado: stack, pastas, arquitectura, padrões obrigatórios, como arrancar |
| 3 | [HANDOVER-03-ANDAMENTO.md](HANDOVER-03-ANDAMENTO.md) | Onde o projecto está: fases feitas, métricas, estado de produção, bloqueadores e próxima acção |

## Documentos de referência do projecto

| Ficheiro | Conteúdo | Quando ler |
|---|---|---|
| `README.md` | Arranque rápido (comandos locais) | Primeiro contacto — mas ver aviso de desactualização abaixo |
| `GUIA-PAINEL.md` | Como a dona usa `/gestao` (linguagem de negócio) | Para entender o produto visto pela dona |
| `apps/api/prisma/schema.prisma` | Modelo de dados real (Week, Day, Order, Admin, SiteConfig, SiteContent) | Antes de mexer na BD |
| `apps/web/src/data/data.ts` | Conteúdo institucional + fallback offline | Antes de mexer na copy do site |
| Wiki `CEREBRO DO CLAUDE/wiki/projetos/colo/{overview,arquitetura,pendencias}.md` | Porquês, gotchas e pendências (em português, no cérebro do Jairo) | Para decisões e histórico |

> O `README.md` foi actualizado em 2026-08-28 para reflectir o pacote semanal e a estrutura actual.

## Regras de ouro antes de tocar em código

1. **Sem suite de testes automatizados** neste projecto: a qualidade é garantida pelo `npm run build` (TypeScript `strict` + `noUnusedLocals` + Vite) que corre no `deploy-colo` da VPS antes de reconstruir os containers. Qualquer alteração tem de deixar o build verde — um build vermelho bloqueia o deploy.
2. **Validação em toda a entrada** com zod (camada API) — manter o padrão ao acrescentar endpoints.
3. **Regras de negócio sensíveis**: vagas descontam em transacção e fecham a semana ao chegar a 0; a semana activa resolve-se SEMPRE no servidor (`lib/activeWeek.ts`) — nunca confiar no `weekId` do cliente; semanas com pedidos não podem ser eliminadas (409).
4. **`PUT /api/config` faz upsert do payload COMPLETO** — páginas que gravam config têm de reenviar `modoAutomaticoSemanas` para não o repor ao default `true`.
5. **Uploads**: whitelist fechada de extensões + validação de magic bytes + CSP no `express.static` — não relaxar (foi fix contra XSS por ficheiro disfarçado).
6. **Não fazer `push` sem o Jairo pedir** — cada push a `main` dispara deploy automático em produção.
7. **Dados sensíveis**: nunca versionar `.env`, passwords, tokens ou a base SQLite. Em produção, confirmar que o `JWT_SECRET` e a conta administradora foram definidos fora do repositório.
