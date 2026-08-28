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
│       └── src/routes/           ← auth, site, weeks, orders, dashboard, content, config
├── GUIA-PAINEL.md     ← guia de uso do painel /gestao para a dona
└── README.md
```

A base de dados é **SQLite** (ficheiro único, sem servidor de BD para gerir) —
suficiente para este site (uma única administradora, baixo tráfego).

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

## 🚀 Publicar (VPS Hostinger)

- **API**: `npm run build && npm start` (ou gerida por PM2/systemd), com
  `DATABASE_URL`, `JWT_SECRET` e `CORS_ORIGIN` definidos em produção.
- **Frontend**: `npm run build` gera `apps/web/dist/`, servido por nginx com
  `try_files $uri /index.html` (SPA) e proxy de `/api` para a API Node.

---

Feito com carinho para a Colo.
