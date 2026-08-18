# Handover Colo Angola — 03 · Nível de Andamento

> **Documento 3 de 3** (ver [HANDOVER-00-INDICE.md](HANDOVER-00-INDICE.md)).
> Foco deste documento: **onde o projecto está hoje** — fases concluídas, métricas reais, estado da produção, bloqueadores e a próxima acção concreta.

---

## 1. Resumo executivo (2026-08-18)

| Indicador | Valor |
|---|---|
| Fase do projecto | **Em produção** — `colo.ao` ao vivo desde 2026-07-02, containerizado desde 2026-07-05 |
| Estado da produção (verificado hoje) | `https://colo.ao` → **200** · `/api/site` → 200 · `/api/health` → 200 |
| Código em produção | Commit `625b249` (2026-08-14) — sincronizado com o GitHub (origin/main) |
| Suíte de testes | **Inexistente** (0 ficheiros de teste no repo) — qualidade garantida pelo build TypeScript strict + Vite no `deploy-colo` |
| Endpoints API | 23 (22 rotas + `/api/health`) |
| Modelos Prisma | 6 (Admin, SiteConfig, Week, Day, Order, SiteContent) |
| Rotas frontend | 9 (site + 8 do painel) |
| CI/CD | Deploy automático em push a `main` (GitHub Actions → VPS) |
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
| **Estabilização do build** | Falha de deploy 2026-08-07 (`TS6133: 'statusText' não usado` em `Hero.tsx` — `noUnusedLocals`); correcção commitada 2026-08-14 (`625b249`, inclui também fix de URLs de upload de imagens e eventos de auth) | ✅ corrigido e **deployado** 2026-08-14 |

---

## 3. Inventário real do código (verificado no repo e via GitHub API em 2026-08-18)

### Repositório
| Item | Contagem |
|---|---|
| Commits no remoto (`am26dev/colo`) | 131 |
| Commits no clone local (raso) | 3 (`5c1741b`, `72eebdc`, `625b249`) |
| Ficheiros (excl. `node_modules/`, `dist/`, lockfiles) | 131 |
| Ficheiros `.ts`/`.tsx` | 82 |
| Workflows GitHub Actions | 1 (`deploy.yml`) |
| Ficheiros de teste (`*.test.*`/`*.spec.*`) | **0** |

### Backend `apps/api/`
| Item | Contagem |
|---|---|
| Endpoints API | **23** (auth 4 · weeks 7 · orders 4 · edit-content 3 · site 1 · config 1 · dashboard 1 · uploads 1 · health 1) |
| Models Prisma | 6 |
| Routers Express | 8 (`auth, config, content, dashboard, orders, site, upload, weeks`) |
| Middlewares | 1 (`requireAuth`) |
| Scripts npm | `dev` (tsx watch), `build` (tsc), `start`, `seed`, `create-admin` |

### Frontend `apps/web/`
| Item | Contagem |
|---|---|
| Rotas (App.tsx) | 9 (1 pública + login + 7 do painel protegido) |
| Secções da Home | 11 (Hero, Galeria, Sobre, Fundadora, MenuSemana, ComoFunciona, Incluído, Testemunhos, Pedido, Citação, NotaColo) |
| Páginas de gestão | 8 (Login, RequireAuth + Dashboard, Pedidos, Semanas, SemanaEditor, Informações, Conta) |
| Componentes `ui/` (caseiros) | 15 |
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
| Hoje (18-08) | Verificação externa: `colo.ao` 200 · `/api/site` 200 · `/api/health` 200 · git na VPS = `625b249` — **produção sincronizada com o repo** |

---

## 5. Estado de produção — detalhe (verificado hoje via curl + SSH à VPS)

| Componente | Estado real | Observação |
|---|---|---|
| DNS + SSL | ✅ | `colo.ao` + `www.colo.ao`, TLS automático via Caddy (Let's Encrypt) |
| Site | ✅ 200 | `https://colo.ao` responde em ~0,6 s |
| API | ✅ 200 | `/api/site` devolve `{ config, week }` com dados reais (mensagem da semana com acentos correctos) |
| Containers | ✅ up | `colo_api` (3004/tcp) e `colo_web` (80/tcp); criados 14-08, restarted 16-08 |
| Código em produção | ✅ `625b249` | Igual ao `origin/main` — a correcção do build de 07-08 está **em produção** |
| Backups da BD | ⚠️ por verificar | BD vive em `apps/api/prisma/dev.db` (volume bind mount) — não há rotina de backup conhecida/verificada |
| Password de demonstração | ⚠️ pendente | Conta `colo@teste.com`/`segredo123` herdada do dev — a dona deve trocar |
| Validação visual | 🔶 pendente | Infra confirmada por curl; falta confirmação da dona em browser real (fluxo de pedido, painel, mobile) |

**Leitura correcta do estado:** o código está estável e em produção; o que falta é **operação de negócio** (validação visual, credenciais da dona, fotos e dados reais) — não trabalho de desenvolvimento funcional.

---

## 6. Bloqueadores e pendências

### Externos / de negócio
1. **Validação visual em browser real** pela dona (fluxo de pedido ponta a ponta, painel `/gestao`, responsividade mobile) — a infraestrutura está confirmada, o ecrã não.
2. **Trocar a password de demonstração** (`colo@teste.com`/`segredo123` é conhecida internamente) ou criar conta nova — via painel → Conta.
3. **Fotos reais das refeições**: no seed a `foto` fica vazia (a dona preenche no editor de semana, com upload real de imagem).
4. **Dados de pagamento reais**: o seed traz valores de exemplo ("923 000 000", "Nome da Titular", IBAN fictício) — a dona deve confirmar os dados exibidos no site via painel → Informações.
5. **Taglines de marca**: confirmar com a dona os textos incorporados no hero/sobre (`data.ts`) ou preferir versões mais curtas.

### Técnicas (registadas no wiki)
6. **`README.md` desactualizado** (modelo pré-pivot: pratos, `MenuState`, `Dish`) — actualizar para reflectir o pacote semanal e a estrutura real.
7. **Sem suite de testes** — considerar testes mínimos (ex.: fluxo de pedido/vagas com vitest/supertest) antes de o site ganhar tráfego real.
8. **Backups da BD** — SQLite é um ficheiro único e frágil a perdas; definir rotina (o volume está no disco da VPS).
9. **`deploy-colo` não versionado** — vive só em `/usr/local/bin/deploy-colo` na VPS (seguir o padrão do MeSafa-Shop: template no repo, cópia instalada na VPS).

---

## 7. Próxima acção concreta

1. **Apresentar o pack à dona (via Jairo)** e validar em browser real: fazer um pedido de teste no site, confirmar que chega ao WhatsApp e ao painel, e ver o painel `/gestao` em mobile.
2. **Actualizar o `README.md`** (e, se a dona aprovar, o GUIA-PAINEL) para o modelo actual — hoje quem chega ao repo lê um produto que já não existe.
3. **Decidir com o Jairo** sobre: password de demonstração, rotina de backup da BD e se vale a pena uma suite de testes mínima antes de crescer o tráfego.
