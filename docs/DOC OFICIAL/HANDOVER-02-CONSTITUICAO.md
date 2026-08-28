# Handover Colo Angola — 02 · Constituição Técnica

> **Documento 2 de 3** (ver [HANDOVER-00-INDICE.md](HANDOVER-00-INDICE.md)).
> Foco deste documento: **como o código está organizado** — stack, pastas, arquitectura, padrões obrigatórios e como arrancar localmente.

---

## 1. Stack (versões verificadas no `package.json`/`package-lock.json` em 2026-08-18)

### Backend — `apps/api/`
| Componente | Versão | Observação |
|---|---|---|
| Node.js | 22 (imagem `node:22-alpine` em produção) | — |
| Express | ^5.2.1 (5.2.1 instalado) | `type: module` (ESM) |
| Prisma / @prisma/client | ^6.19.3 (6.19.3 instalado) | `prisma-client-js` clássico (Prisma 7 exigiria adaptadores — decisão de ficar no 6) |
| Base de dados | **SQLite** (ficheiro único `apps/api/prisma/dev.db`; produção via bind mount) | Sem servidor de BD |
| Validação | zod ^4.4.3 | Toda a entrada da API |
| Auth | jsonwebtoken ^9.0.3 (JWT, expira em 7 dias) + bcryptjs ^3.0.3 | — |
| Uploads | multer ^2.2.0 (5 MB, whitelist + magic bytes) | Disco local `apps/api/uploads/` |
| Outros | cors ^2.8.6, dotenv ^17.4.2 | — |
| Dev | TypeScript ^6.0.3, tsx ^4.22.4, @types/node ^26 | Build = `tsc` puro (ver 3.2) |

### Frontend — `apps/web/`
| Componente | Versão | Observação |
|---|---|---|
| Vite | ^8.1.1 (8.1.2 instalado) | SPA; build = `tsc -b && vite build` |
| React | ^19.2.7 (19.2.7 instalado) | — |
| react-router-dom | ^7.18.3 | Rotas: site + `/gestao/*` |
| Tailwind CSS | v4 (^4.3.2 + `@tailwindcss/vite`) | Escopado ao painel via `@source` (o site público usa `styles.css` próprio) |
| UI do painel | Componentes **caseiros** em `components/ui/` (shadcn-style, sem radix; `sonner.tsx` é um toaster leve sem dependências) | clsx + tailwind-merge |
| Lint | oxlint ^1.71.0 | `npm run lint` |
| Dev | TypeScript ~6.0.2, @vitejs/plugin-react ^6.0.3 | — |

### Infraestrutura (produção)
- VPS Hostinger partilhada `72.60.131.174` · edge Caddy independente em `/opt/edge` (rede docker `edge`, roteia por nome de container)
- Docker Compose (`compose.yaml`): **2 serviços** — `colo_api` + `colo_web` — **zero portas publicadas** no host
- CI/CD GitHub Actions: deploy automático em cada push a `main` (`.github/workflows/deploy.yml`)
- Domínios: `colo.ao` + `www.colo.ao` (Let's Encrypt via Caddy)

---

## 2. Estrutura do repositório

```
colo/                          # Monorepo simples (apps/api + apps/web)
├── apps/
│   ├── api/                   # Backend Express (monolito pequeno, routers por domínio)
│   │   ├── prisma/
│   │   │   ├── schema.prisma  # 6 models: Admin, SiteConfig, Week, Day, Order, SiteContent
│   │   │   ├── seed.ts        # Seed idempotente (config + semanas + conteúdo editável)
│   │   │   └── seed-data.json # Dados de exemplo (preço 100.000 Kz, 6 vagas, 2 semanas)
│   │   ├── scripts/create-admin.ts
│   │   └── src/
│   │       ├── server.ts / app.ts    # app.ts monta os routers + /uploads estático
│   │       ├── db.ts                 # PrismaClient singleton
│   │       ├── lib/                  # activeWeek.ts (resolução semana), jwt.ts, serialize.ts
│   │       ├── middleware/auth.ts    # requireAuth (Bearer JWT)
│   │       └── routes/               # auth, config, content, dashboard, orders, site, upload, weeks
│   └── web/                    # Frontend SPA
│       ├── src/
│       │   ├── App.tsx        # Rotas (ver 3.4)
│       │   ├── pages/         # Home.tsx + gestao/ (Login, RequireAuth, Dashboard, Pedidos, Semanas, SemanaEditor, Informacoes, Conta)
│       │   ├── components/    # sections/ (11 secções da home), menu/, pedido/, layout/, gestao/, ui/ (15 caseiros)
│       │   ├── context/       # AuthContext.tsx
│       │   ├── edit-mode/     # AdminFab, EditToolbar, EditableText/EditableImage, EditModeProvider
│       │   ├── data/          # data.ts (conteúdo + fallback), content-defaults.ts
│       │   ├── hooks/         # useSiteContent.ts (fallback 2,5 s)
│       │   ├── lib/           # api.ts (fetch + token), image.ts, utils.ts
│       │   ├── styles/        # styles.css (site), painel.css (Tailwind v4 + overrides)
│       │   ├── types/ utils/  # tipos do domínio, format (Kz), whatsapp
│       │   └── main.tsx
│       └── public/assets/img/ # fotos e favicon
├── docker/
│   ├── api.Dockerfile         # node:22-alpine; empacota dist/ + prisma (dados via bind mount)
│   ├── web.Dockerfile         # nginx:alpine; serve apps/web/dist
│   └── nginx-web.conf         # SPA fallback (try_files → /index.html)
├── .github/workflows/deploy.yml  # CI/CD (ver secção 5)
├── compose.yaml               # 2 serviços na rede edge, volumes prisma+uploads
├── GUIA-PAINEL.md             # Guia do painel para a dona
└── README.md                  # ⚠️ Desactualizado (modelo pré-pivot) — usar só para comandos
```

> **Nota de verificação:** o clone local é raso (3 commits); o remoto `am26dev/colo` tem **131 commits** (verificado via API do GitHub).

---

## 3. Arquitectura

### 3.1 Princípio geral
SPA React (Vite) que fala com a API Express em REST (`/api/*`). Em produção tudo é **same-origin**: o nginx do container `colo_web` serve os estáticos e o Caddy do edge faz proxy de `/api/*` e `/uploads/*` para `colo_api` (porta 3004). Em dev, `VITE_API_URL` aponta para a API local.

### 3.2 Backend — padrões observados
1. **Routers por domínio** (`routes/weeks.ts`, `orders.ts`, ...) montados em `app.ts` — controllers inexistentes por design (monolito pequeno).
2. **Zod em toda a entrada**: cada router valida com `safeParse` e responde `400 { erro }`; mensagens em pt.
3. **Transacções Prisma** para regras atómicas: desconto de vaga + criação de pedido; activação manual de semana (desliga as outras); `PUT /api/weeks/:id` (apaga dias e recria).
4. **Autorização por middleware** `requireAuth` (JWT Bearer de 7 dias); routers privados aplicam `router.use(requireAuth)` no topo.
5. **Semana activa sempre no servidor** (`lib/activeWeek.ts`): modo automático por intervalo de datas em UTC, ou `ativaManual`; nunca aceitar `weekId` do cliente.
6. **SQLite sem enums nativos**: estados validados por zod como strings (`"aberto"|"fechado"|"oculto"`, `"novo"|"confirmado"|"cancelado"`, `"almoco"|"sobremesa"`); listas estruturadas (refeições, pagamento) como `Json`.
7. **Uploads seguros**: whitelist fechada de extensões + MIME, **magic bytes** do ficheiro gravado (remove se não for imagem válida) e CSP/`X-Content-Type-Options` no `express.static` de `/uploads`.
8. **Endpoints API: 23 no total** (ver contagem no HANDOVER-03).
9. **`serialize.ts`** centraliza a forma como objetos são devolvidos à API.

### 3.3 Modelo de dados (Prisma — 6 models)
- **Admin** — email único + `passwordHash` (bcrypt).
- **SiteConfig** — linha única (id 1): WhatsApp, Instagram, domínio, moeda, mensagem da semana, `pagamento` (Json), `modoAutomaticoSemanas`.
- **Week** — datas, `precoSemanal`, estado, `vagasTotais`/`vagasRestantes`, `ativaManual`; 1:N Day, 1:N Order.
- **Day** — `diaSemana` 1–5 (único por semana), tema, `icone` (legado, já não editado na UI), frase, `refeicoes` (Json).
- **Order** — `tipo` semana|especial, nome, contacto, `ciclo` (fase do ciclo), notas, estado.
- **SiteContent** — key-value store (Json) para o modo edição do site público.

### 3.4 Frontend — padrões observados
1. **Rotas (9, em `App.tsx`)**: `/` (Home) · `/gestao/login` · `/gestao` (dashboard) · `/gestao/pedidos` · `/gestao/semanas` · `/gestao/semanas/nova` · `/gestao/semanas/:id` · `/gestao/informacoes` · `/gestao/conta`.
2. **Protecção do painel**: `RequireAuth` (wrapper) + `AuthContext`; token no `localStorage` (`colo_token`) com evento `colo-auth-changed` para sincronizar estado.
3. **Sem Server State lib**: fetch directo via `lib/api.ts` (wrapper com token, `Content-Type`, limpeza de sessão em 401 e erro pt vindo da API).
4. **Fallback resiliente**: `useSiteContent` com timeout de 2,5 s → `data.ts` (`defaultWeek`/`defaultConfig`) para o site nunca ficar em branco.
5. **Modo edição** (edit-mode/): `AdminFab` + `EditToolbar` + `EditableText`/`EditableImage` — textos e imagens da home editáveis inline, gravados em `SiteContent`.
6. **CSS em camadas**: `styles.css` (identidade da marca, site público) + Tailwind v4 escopado ao painel (`painel.css`, preflight neutralizado com overrides no fim).
7. **UI caseira**: componentes em `components/ui/` sem dependência de radix/shadcn — mantê-los consistentes ao alterar.

---

## 4. Como arrancar localmente

### Requisitos
Node 22+ e npm.

### Backend (`apps/api/`)
```bash
npm install
cp .env.example .env        # DATABASE_URL="file:./dev.db", PORT=4000, JWT_SECRET (qualquer valor em dev)
npx prisma migrate deploy
npm run seed                # config + semanas + conteúdo padrão
npm run dev                 # API em http://localhost:4000 (tsx watch)
```

### Frontend (`apps/web/`)
```bash
npm install
cp .env.example .env        # VITE_API_URL=http://localhost:4000
npm run dev                 # http://localhost:5173
npm run build               # tsc -b && vite build (tem de ficar limpo — é o que o CI/produção exige)
npm run lint                # oxlint
```

### Primeiro admin
Na primeira visita a `/gestao`, o site detecta que não há admin (`/api/auth/setup-needed`) e pede email + palavra-passe (`POST /api/auth/setup`).

Também é possível definir `ADMIN_EMAIL` e `ADMIN_PASSWORD` no `apps/api/.env` e executar `npm run seed`; o seed faz upsert idempotente do administrador. Nunca colocar valores reais no repositório ou na documentação.

---

## 5. Produção

### Serviços Docker (`compose.yaml`)
| Serviço | Imagem | Papel |
|---|---|---|
| `colo_api` | `colo-app-api` (node:22-alpine) | Express na porta 3004; `node dist/src/server.js` (o tsconfig tem `rootDir: "."`, preserva `src/` em `dist/`) |
| `colo_web` | `colo-app-web` (nginx:alpine) | Estáticos do SPA com fallback `try_files → /index.html` |

- Rede `edge` (externa, do Caddy `/opt/edge`) — **zero portas publicadas**.
- Volumes bind mount: `apps/api/prisma` (BD viva + schema) e `apps/api/uploads` (ficheiros) — sobrevivem a redeploys.
- Caddy: `/api/*` e `/uploads/*` → `colo_api`; resto → `colo_web` (usar `handle`, nunca `handle_path` — o Express espera os paths completos).
- TLS automático (Let's Encrypt) para `colo.ao` + `www.colo.ao`.

### CI/CD
`.github/workflows/deploy.yml`: em push a `main`, `appleboy/ssh-action` (fixada ao commit da v1.2.2, `permissions: contents: read`) liga à VPS por SSH com chave dedicada restrita por `command=` no `authorized_keys` a correr **só** `/usr/local/bin/deploy-colo`. Não há jobs de testes/lint no CI — a verificação é o build.

`deploy-colo` (cópia instalada na VPS; **não versionada no repo**) corre:
```
cd /var/www/colo-app && git pull origin main
cd apps/api && npm ci && npx prisma generate && npx prisma migrate deploy && npm run build
cd ../web && npm ci && npm run build        # tsc -b com noUnusedLocals — falha = deploy aborta
cd /var/www/colo-app && docker compose build && docker compose up -d
```

### ⚠️ Gotchas de produção (já vividos — não repetir)
1. **Build no host, não na imagem**: os Dockerfiles só empacotam `dist/` — o `tsc`/`vite build` correm no host dentro do `deploy-colo`. Um erro de TypeScript (ex.: `noUnusedLocals` com variáveis órfãs) falha o deploy; os containers antigos ficam a correr (o site não cai, mas fica em código antigo).
2. **`DATABASE_URL` dentro do container**: tem de ser `file:./dev.db` (relativo ao `schema.prisma`) — o path absoluto do host não funciona no container (`PrismaClientInitializationError`).
3. **Ficheiros criados directo na VPS antes de commitados**: o `git pull` falha com "untracked working tree files would be overwritten" — apagar a cópia solta na VPS após o primeiro `git push` desses ficheiros.
4. **Caddy `handle` vs `handle_path`**: usar `handle` (preserva o path); `handle_path` corta o prefixo e quebra `/api/...` no Express.
5. **`/uploads` sem `X-Content-Type-Options: nosniff` + CSP** já esteve exposto a XSS por ficheiro disfarçado — corrigido com whitelist + magic bytes + cabeçalhos; não reverter.
6. **`deploy-colo` não está no repo** — qualquer alteração ao script tem de ser feita na VPS (`/usr/local/bin/deploy-colo`).
