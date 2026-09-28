# Colo — *Comida que cuida de ti*

Site da marca **Colo**: comida pensada na mulher — saudável, anti-inflamatória
e personalizada conforme o ciclo menstrual. Mercado: **Angola**.

> Marca angolana · domínio **.ao** · conteúdo em **português de Portugal** · moeda **Kwanza (Kz)**.

---

## ✨ O que faz

- **Página única** e responsiva com a identidade da Colo.
- **Menu da semana**, atualizado normalmente às quintas-feiras, com 5 dias de almoço + momento doce.
- **Vagas limitadas por semana**: quando enchem (ou a dona encerra manualmente),
  o site mostra *"pedidos encerrados"* mas mantém o menu visível.
- **Reservas com prazo**: um pedido novo segura uma vaga sem a consumir. A vaga
  só é consumida quando a dona o marca como **confirmado** no painel; se passar
  o prazo (`RESERVA_TTL_HORAS`, 48 h por omissão) a reserva expira e o lugar
  volta a estar livre — o pedido não se perde, continua no painel e pode ser
  confirmado à mão.
- **Pedido pelo WhatsApp**: a cliente preenche um formulário e o pedido chega já
  escrito ao WhatsApp da Colo.
- **Pagamento por Multicaixa Express** / transferência.
- **Personalização por ciclo**: a cliente indica a fase do ciclo no pedido.
- **Mensagem da Colo** (semanal/diária) editável.
- **Painel de gestão** (`/gestao`): a dona edita menu, vagas/estado, contactos e
  a mensagem da semana **sem mexer em código**.

---

## 🗂️ Estrutura (monorepo)

```
colo/
├── apps/
│   ├── web/          ← frontend (Vite + React + TypeScript)
│   │   ├── src/
│   │   │   ├── data/data.ts     ← conteúdo estático institucional + fallback
│   │   │   ├── components/      ← layout, secções, menu, pedido, painel
│   │   │   ├── pages/            ← Home, gestao/{Login,Painel}
│   │   │   ├── hooks/            ← useSiteContent (com fallback), etc.
│   │   │   └── styles.css        ← visual da marca
│   │   └── public/assets/img/    ← fotos e favicon
│   └── api/           ← backend (Express + Prisma + SQLite)
│       ├── prisma/schema.prisma  ← Admin, SiteConfig, Week, Day, Order, SiteContent
│       ├── prisma/seed.ts        ← dados iniciais
│       ├── src/routes/           ← auth, site, weeks, orders, dashboard, content, config
│       └── tests/                ← 52 testes da API (reservas, vagas, authz, rate limit)
├── scripts/
│   ├── deploy-colo.sh   ← deploy de produção (backup → build → migrate → compose → health check)
│   └── backup-colo-db.py← cópia consistente da BD SQLite, com verificação de integridade
├── docker/            ← Dockerfiles (api, web) e o nginx que serve o frontend
├── compose.yaml       ← colo_api + colo_web na rede `edge` do Caddy (sem portas publicadas)
├── docs/DOC OFICIAL/  ← handover do projecto
├── GUIA-PAINEL.md     ← guia de uso do painel /gestao para a dona
└── README.md
```

A base de dados é **SQLite** (ficheiro único, sem servidor de BD para gerir) —
suficiente para este site (uma única administradora, baixo tráfego). Por ser um
ficheiro só, depende de cópias de segurança: ver
[`scripts/backup-colo-db.py`](scripts/backup-colo-db.py).

---

## ▶️ Correr localmente

Backend (API):

```bash
cd apps/api
npm install
cp .env.example .env          # ajusta se necessário
npx prisma migrate deploy
  npm run seed                  # dados iniciais (config + semanas + conteúdo)
npm run dev                   # http://localhost:4000
```

Frontend:

```bash
cd apps/web
npm install
cp .env.example .env          # VITE_API_URL aponta para a API acima
npm run dev                   # http://localhost:5173
```

Para criar ou atualizar o administrador através do seed, define `ADMIN_EMAIL` e
`ADMIN_PASSWORD` no `.env` antes de executar `npm run seed`. Alternativamente,
usa o fluxo inicial de `/gestao` enquanto ainda não existir administrador.

Nunca versionar `.env`, passwords, tokens ou a base `dev.db`.

---

## 🧪 Testes

A API tem 52 testes com o runner nativo do Node (sem dependências extra de
teste). Correm contra uma BD própria (`prisma/teste.db`), nunca contra a de
produção:

```bash
cd apps/api
npm test
```

Cobrem o que não pode regredir em silêncio: o ciclo de uma vaga (reservar →
confirmar → devolver), o prazo das reservas e a sua expiração, autorização dos
endpoints e o rate limit.

---

## 🚀 Publicar (produção)

O deploy na VPS é um `docker compose` de dois serviços, ambos na rede `edge` do
Caddy e **sem portas publicadas** — o Caddy é o único que chega à internet:

- `colo_api` — Express, com `prisma/` e `uploads/` montados a partir do host
  (os dados não vivem na imagem).
- `colo_web` — nginx a servir `apps/web/dist/`, com a `Content-Security-Policy` e
  os restantes cabeçalhos de segurança em `docker/nginx-web.conf`.

Um push para `main` acciona o GitHub Actions, que entra na VPS e corre
`deploy-colo`. Na VPS, `/usr/local/bin/deploy-colo` limita-se a delegar no
script versionado, para o que corre em produção ser exactamente o que está no
Git:

```bash
/var/www/colo-app/scripts/deploy-colo.sh
```

O script, por ordem: actualiza o código → **faz cópia de segurança da BD** →
compila API e frontend → aplica as migrações → reconstrói os containers →
verifica que `/api/health` responde. A cópia de segurança vem antes das
migrações de propósito: se uma migração correr mal, é a única forma de voltar
atrás.

Cópia de segurança da BD, a qualquer momento:

```bash
python3 scripts/backup-colo-db.py    # → /var/backups/colo/colo_<data>.db
```

Usa a API `backup()` do `sqlite3` em vez de `cp`, porque a API escreve no
ficheiro a cada pedido e uma cópia byte a byte de um ficheiro em escrita pode
sair truncada. No fim verifica `integrity_check` e guarda as 30 cópias mais
recentes.

---

Feito com carinho para a Colo.
