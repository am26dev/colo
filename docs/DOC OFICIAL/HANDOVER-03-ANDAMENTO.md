# Handover Colo Angola — 03 · Nível de Andamento

> **Documento 3 de 3** (ver [HANDOVER-00-INDICE.md](HANDOVER-00-INDICE.md)).
> Foco deste documento: **onde o projecto está hoje** — fases concluídas, métricas reais, estado da produção, bloqueadores e a próxima acção concreta.

---

## 1. Resumo executivo (2026-09-28)

| Indicador | Valor |
|---|---|
| Fase do projecto | **Em produção** — `colo.ao` ao vivo desde 2026-07-02, containerizado desde 2026-07-05 |
| Estado da produção (verificado hoje) | `https://colo.ao` → **200** · `/api/site` → 200 · `/api/health` → 200 |
| Código em produção | Commit `eca5bd7` (2026-09-22) |
| Suíte de testes | **52 testes, 4 ficheiros, 846 linhas — todos a passar** (`npm test` em `apps/api`) |
| Endpoints API | 23 (22 rotas + `/api/health`) |
| Modelos Prisma | 6 (Admin, SiteConfig, Week, Day, Order, SiteContent) |
| Rotas frontend | 12 (`App.tsx`) |
| CI/CD | Deploy automático em push a `main` (GitHub Actions → VPS), com script de deploy versionado |
| Backups da BD | Rotina implementada: `scripts/backup-colo-db.py`, primeira cópia verificada em 2026-09-28 |
| Dependências runtime | `npm audit --omit=dev`: API e web **0 vulnerabilidades** no caminho de execução; restam 3 `high` só na CLI do Prisma (ver §6) |
| Pendências de negócio | Validação visual em browser real · trocar password de demonstração · fotos reais das refeições · dados de pagamento reais |

---

## 2. Andamento por fase

| Fase | Conteúdo | Estado |
|---|---|---|
| **Migração inicial** | Site antigo (HTML/PHP) → React + Node/Express + Prisma/SQLite | ✅ 2026-07-01 |
| **Pivot de negócio** | Pratos avulsos → **pacote semanal** (5 dias × 2 momentos, preço único, 6 vagas) + pedidos persistidos na BD + painel `/gestao` (Dashboard/Pedidos/Semanas/Informações/Conta) | ✅ 2026-07-02 |
| **Lançamento** | Deploy na VPS (PM2+nginx), DNS (`A @` e `A www` → 72.60.131.174), SSL Let's Encrypt; `colo.ao` a 200 | ✅ 2026-07-02 |
| **CI/CD** | GitHub Actions + chave restrita por `command=`; primeiro deploy automático OK | ✅ 2026-07-03 (reforço de segurança: SHA fixa + `permissions` no mesmo dia) |
| **Containerização** | PM2/nginx-host aposentados → `colo_api` + `colo_web` na rede `edge` do Caddy, zero portas publicadas; `compose.yaml`+`docker/` versionados (commit `3b1295d`, 07-07) | ✅ 2026-07-05 |
| **Simplificação do menu** | 4 refeições → 2 momentos (almoço+sobremesa); ícone por dia removido da gestão; correcção de `icone:` residual que quebrava `tsc -b` | ✅ 2026-07-03 (correcção de build no mesmo dia) |
| **Modo edição do site** | `AdminFab`/`EditToolbar`/`EditableText`/`EditableImage` + `SiteContent` (key-value) + uploads com compressão no browser; testemunhos e rodapé ligados ao modo edição | ✅ 2026-07-13/14 |
| **Actualizações de conteúdo e segurança** | Menu publicado usa `Week/Day` e fotos da API; logo no rodapé/citação; formulários editáveis; estrelas removidas; assinatura pessoal; checks de autorização, upload e traversal executados | ✅ 2026-08-28 |
| **Reservas com prazo** | Um pedido novo passa a ser reserva: segura uma vaga sem a consumir; só o **confirmar** consome vaga; passado `RESERVA_TTL_HORAS` (48 h) expira e liberta o lugar sem perder o pedido. Distingue fecho **automático por esgotamento** de fecho manual da dona (`Week.fechadaPorEsgotamento`) | ✅ 2026-09-27/28 |
| **Cabeçalhos de segurança (CSP)** | `Content-Security-Policy` + `X-Content-Type-Options` + `Referrer-Policy` + `X-Frame-Options` servidos pelo `nginx-web.conf` versionado — acompanham o deploy em vez de se perderem num reload do edge | ✅ 2026-09-27/28 |
| **Rate limit na API** | `middleware/rateLimit` + `trust proxy` (1 salto) — sem isto o Caddy fazia com que todos os clientes contassem como um só e o limite bloqueava o site inteiro | ✅ 2026-09-27/28 |
| **Suíte de testes** | 52 testes com o runner nativo do Node (`node --test`) sobre reservas, ciclos de pedido/vaga, autorização e rate limit; apanhou 1 bug real (expiração de reservas) | ✅ 2026-09-28 |
| **Operação** | `deploy-colo` e rotina de backup versionados no repo; `.gitignore` passa a excluir `*.db` | ✅ 2026-09-28 |
| **Estabilização do build** | Falha de deploy 2026-08-07 (`TS6133: 'statusText' não usado` em `Hero.tsx` — `noUnusedLocals`); correcção commitada 2026-08-14 (`625b249`, inclui também fix de URLs de upload de imagens e eventos de auth) | ✅ corrigido e **deployado** 2026-08-14 |

---

## 3. Inventário real do código (verificado no repo em 2026-09-28)

### Repositório
| Item | Contagem |
|---|---|
| Ficheiros versionados (excl. lockfiles) | 146 |
| Ficheiros `.ts`/`.tsx` | 85 |
| Workflows GitHub Actions | 1 (`deploy.yml`) |
| Ficheiros de teste (`*.test.ts`) | **4** (+ `tests/helpers.ts`), 846 linhas, 52 casos |
| Scripts de operação | 2 (`scripts/deploy-colo.sh`, `scripts/backup-colo-db.py`) |
| Migrações Prisma | 5 |

> O clone local é raso (`--depth`), por isso a contagem de commits do histórico
> completo não é fiável a partir daqui — confirmar no GitHub se for precisa.

### Backend `apps/api/`
| Item | Contagem |
|---|---|
| Endpoints API | **23** |
| Models Prisma | 6 |
| Routers Express | 8 (`auth, config, content, dashboard, orders, site, upload, weeks`) |
| Middlewares | 2 (`requireAuth`, `rateLimit`) |
| Scripts npm | `dev`, `build`, `start`, `seed`, `create-admin`, `test` |

### Frontend `apps/web/`
| Item | Contagem |
|---|---|
| Rotas (App.tsx) | 9 (1 pública + login + 7 do painel protegido) |
| Secções da Home | 11 (Hero, Galeria, Sobre, Fundadora, MenuSemana, ComoFunciona, Incluído, Testemunhos, Pedido, Citação, NotaColo) |
| Páginas de gestão | 8 (Login, RequireAuth + Dashboard, Pedidos, Semanas, SemanaEditor, Informações, Conta) |
| Componentes `ui/` (caseiros) | 17 |
| Componentes `edit-mode/` | 5 |
| Stores/persistência | Token JWT no `localStorage` (`colo_token`) |

### Cobertura funcional (áreas implementadas)
- **Site público**: menu da semana com temas/frases, vagas restantes, pedido normal (com fase do ciclo) e especial, pagamento (dados da dona), mensagem da Colo, contacto WhatsApp, modo edição inline de copy/imagens.
- **Painel `/gestao`**: dashboard (resumo da semana activa, pedidos novos/totais), gestão de pedidos (confirmar/cancelar/eliminar), CRUD completo de semanas (criar, editar com re-upload de fotos, activar manual, abrir/encerrar, ocultar), informações do site (WhatsApp, Instagram, pagamento, mensagem, moeda, domínio), alteração de password.

---

## 4. Cronologia recente

| Data | Acontecimento |
|---|---|
| 2026-06-16 | Repositório `am26dev/colo` criado |
| 2026-07-01 | Migração HTML/PHP → React+Node/SQLite concluída |
| 2026-07-02 | **Pivot de negócio**: pacote semanal + pedidos persistidos + painel `/gestao`; deploy manual na VPS (PM2+nginx); DNS `A` apontado; SSL emitido; `colo.ao` a 200 (confirmado por curl real) |
| 2026-07-03 | Simplificação do menu (2 momentos); CI/CD GitHub Actions; primeiro deploy automático; hardening do workflow (SHA fixa, permissions mínimas); bug de dados: semana de produção com tipos antigos (`jantar`→`sobremesa`) corrigido via script Prisma |
| 2026-07-05 | **Containerização**: `colo_api` + `colo_web` na rede `edge` do Caddy; PM2 parado (rede de segurança) |
| 2026-07-07 | `compose.yaml` + `docker/` commitados (`3b1295d`); gotcha do `git pull` (ficheiros soltos na VPS) resolvido |
| 2026-07-13/14 | Modo edição completo (textos/imagens da home editáveis), compressão de imagens no browser, testemunhos/rodapé editáveis, correcção de builds (imports não usados) |
| 2026-08-07 | Commit da nova logo + imagem de salada (`5c1741b`) → **deploy falha** no `tsc -b` (`statusText` órfão em `Hero.tsx`); correcção preparada localmente |
| 2026-08-14 | Correção commitada e pushada (`72eebdc` + `625b249`): build limpo, URLs de upload corrigidas, eventos de auth; **deploy automático corre com sucesso** (imagens criadas 2026-08-14T09:38, containers recriados) |
| 2026-08-16 | Restart dos containers `colo_api` (22:54 UTC) — imagens mantêm-se as de 14-08 |
| 2026-08-18 | Verificação externa: `colo.ao` 200 · `/api/site` 200 · `/api/health` 200 — produção sincronizada com o repo |
| 2026-08-28 | Actualizações de conteúdo e segurança; estado do projecto registado neste documento |
| 2026-09-14 | Melhorias de UX do painel (`419cde3`): página 404, redireccionamentos de login, botões flutuantes, SPA fallback servido pelo Express |
| 2026-09-22 | `MenuSemana` com carousel de dias e modal de detalhe (`1e59c4b`) + null-guards defensivos no painel (`eca5bd7`) — **último commit em produção** |
| 2026-09-27/28 | Reservas com prazo, `Week.fechadaPorEsgotamento`, rate limit + `trust proxy`, CSP e cabeçalhos de segurança, correcção de `multer`/`qs`; 52 testes que apanharam 1 bug real de expiração |
| 2026-09-28 | Rotina de backup da BD e `deploy-colo` versionados; primeira cópia verificada (integridade `ok`); migrações ensaiadas contra uma cópia da BD real — dados preservados |

---

## 5. Estado de produção — detalhe (verificado em 2026-09-28)

| Componente | Estado real | Observação |
|---|---|---|
| DNS + SSL | ✅ | `colo.ao` + `www.colo.ao`, TLS automático via Caddy (Let's Encrypt) |
| Site | ✅ 200 | servido por `colo_web` (nginx) com os cabeçalhos de segurança |
| API | ✅ 200 | `/api/health` → `{"ok":true}`, `/api/site` devolve `{ config, week }` |
| Containers | ✅ up | `colo_api` (3004/tcp) e `colo_web` (80/tcp), na rede `edge` do Caddy |
| Base de dados | ✅ `apps/api/prisma/dev.db` | 80 KB, bind mount para o container; 86 `SiteContent`, 1 `Week`, 5 `Day`, 1 `Admin`, 3 migrações aplicadas |
| Backups da BD | ✅ rotina criada | `scripts/backup-colo-db.py` → `/var/backups/colo/colo_<timestamp>.db`, rotação de 30 cópias, verificação `integrity_check`; primeira cópia feita e verificada em 2026-09-28 |
| Migrações | ✅ ensaiadas | As 2 migrações novas foram aplicadas contra uma **cópia da BD de produção** antes do deploy: só acresentam colunas e índices, contagens de todas as tabelas preservadas |
| Deploy | ✅ versionado | `/usr/local/bin/deploy-colo` passou a delegar em `scripts/deploy-colo.sh` (backup → build → migrate → `compose up -d` → health check) |
| Credenciais de produção | ⚠️ por confirmar | Não documentar valores; confirmar que o `JWT_SECRET` e a password real foram trocados |
| Validação visual | 🔶 pendente | Infra confirmada por curl; falta confirmação da dona em browser real (fluxo de pedido, painel, mobile) |

**Leitura correcta do estado:** o código está estável e em produção, com testes,
backups e um deploy reprodutível. O que falta é **operação de negócio**
(validação visual, credenciais da dona, fotos e dados reais) — não trabalho de
desenvolvimento funcional.

---

## 6. Bloqueadores e pendências

### Externos / de negócio
1. **Validação visual em browser real** pela dona (fluxo de pedido ponta a ponta, painel `/gestao`, responsividade mobile) — a infraestrutura está confirmada, o ecrã não.
2. **Confirmar as credenciais da administradora** via painel → Conta, sem partilhar ou registar a password.
3. **Fotos reais das refeições**: no seed a `foto` fica vazia (a dona preenche no editor de semana, com upload real de imagem).
4. **Dados de pagamento reais**: o seed traz valores de exemplo ("923 000 000", "Nome da Titular", IBAN fictício) — a dona deve confirmar os dados exibidos no site via painel → Informações.
5. **Taglines de marca**: confirmar com a dona os textos incorporados no hero/sobre (`data.ts`) ou preferir versões mais curtas.

### Técnicas
6. **3 vulnerabilidades `high` da CLI do Prisma** (`deepmerge-ts` via `@prisma/config`) — **decisão: não corrigir agora.** Estão na dependência `prisma`, que é `devDependency`: só corre em build/migração, nunca no servidor. `@prisma/client` não tem dependências próprias, e o caminho de execução da API está limpo. `npm audit fix --force` mexeria na versão do Prisma — risco de build e migração maior do que o problema que resolve. Rever se o Prisma publicar versão sem o problema.
7. **Cobertura de testes só na API** — o frontend (React) continua sem testes; as regras de negócio de vagas/reservas é que não podem regredir em silêncio.
8. **Rotina de backup ainda sem automação** — o script existe e foi executado à mão; falta agendamento (cron/systemd timer) e cópia fora da VPS.
9. **`README.md`** — actualizado com as reservas; confirmar que reflecte o estado actual na próxima revisão.

## 6-bis. Notas de implementação (porquê, não o quê)

**Reservas com prazo.** Antes, criar um pedido consumia uma vaga logo. Com
poucos clientes a desaparecerem depois de pedir, a semana fechava com lugares
pagos por ninguém. Agora `estado="novo"` é uma *reserva*: segura a vaga até
`expiresAt` (`RESERVA_TTL_HORAS`, 48 h). A vaga só é consumida ao confirmar. A
reserva vence de forma passiva (as contagens já ignoram as vencidas) e explícita
(varredura preguiçosa, idempotente), e o pedido **nunca se perde** — a dona pode
confirmar uma reserva vencida à mão.

**`Week.fechadaPorEsgotamento`.** Ao devolver uma vaga, a semana tinha de ser
reaberta. Mas se a dona a tinha fechado à mão, devolvê-la passava por cima de
um fecho deliberado. A coluna distingue os dois casos: só o fecho automático
pode ser desfeito por devolução de vaga; qualquer acção manual volta a pôr
`false`.

**`trust proxy` = 1.** O tráfego chega do Caddy. Sem isto, `req.ip` era sempre o
endereço do Caddy e o rate limit contava todos os clientes como um só — ou seja,
bloqueava o site inteiro. Confiar em 1 salto limita a confiança ao
`X-Forwarded-For` que o Caddy reescreve, que um cliente não consegue forjar.

**CSP sem `unsafe-inline` nos scripts.** Fica no `nginx-web.conf` versionado (e
não no Caddy ou no `index.html`) para acompanhar o deploy. O build do Vite emite
um único script externo e zero `<style>` em runtime — verificado no bundle real
— por isso `script-src 'self'` e `style-src 'self'` chegam. Só
`style-src-attr` precisa de `'unsafe-inline'`, porque o React escreve atributos
`style=""` para as fontes.

**Backup com a API `backup()` do sqlite3, não `cp`.** A API escreve no ficheiro
a cada pedido; copiar um SQLite em escrita byte a byte pode sair truncado.

---

## 7. Próxima acção concreta

1. **Validar em browser real**: fluxo de pedido (incluindo o prazo das reservas),
   painel `/gestao`, edição dos formulários, menu com fotos e responsividade
   mobile. A suíte cobre a API, não o ecrã.
2. **Confirmar credenciais de produção** sem as registar em documentação.
3. **Agendar o backup** (`cron` diário para `scripts/backup-colo-db.py`) e
   pensar numa cópia fora da VPS — uma cópia na mesma máquina não sobrevive à
   perda da máquina.
4. **Confirmar com a dona o prazo das 48 h** e o texto que a cliente vê quando
   a reserva expira.
