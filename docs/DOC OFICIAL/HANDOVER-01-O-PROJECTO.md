# Handover Colo Angola — 01 · O Projecto

> **Documento 1 de 3** (ver [HANDOVER-00-INDICE.md](HANDOVER-00-INDICE.md)).
> Foco deste documento: **o que é o produto, para quem, como ganha dinheiro e que decisões já foram tomadas** — o contexto de negócio que precisas antes de olhar para o código.

---

## 1. O que é

**Colo** (*"Comida que cuida de ti"*) é uma **assinatura semanal de refeições saudáveis e anti-inflamatórias**, pensada para a mulher e adaptada à fase do ciclo menstrual. A cliente recebe uma semana completa de refeições, cozinhadas no próprio dia e entregues em casa, em Luanda.

Marca angolana, desenvolvida por **Muds** (crédito no rodapé), com domínio **`colo.ao`**, conteúdo em **português de Portugal** e moeda **Kwanza (Kz)**.

**O Colo não vende pratos avulsos** — vende um **pacote semanal único**:
- **5 dias úteis** (Segunda a Sexta), cada dia com **2 momentos**: Almoço e Sobremesa
- Cada dia tem um **tema poético** (ex.: "Leveza & Frescura") e uma **frase de carinho**
- **Um preço único para a semana toda** (100 000 Kz no seed) — a cliente escolhe "o menu", não um prato
- **Vagas limitadas** (6 por semana no seed) que descontam a cada pedido e fecham a semana sozinhas ao chegar a 0

### Público-alvo

| Perfil | Quem é | O que faz na plataforma |
|---|---|---|
| **Cliente** | Mulheres em Luanda e zonas próximas | Vê o menu da semana, faz pedido (normal ou especial), paga por Multicaixa Express/transferência |
| **Administradora (a dona, Winnie)** | A única gestora do negócio | Usa o painel `/gestao` para gerir semanas, vagas, pedidos, informações do site e a mensagem da semana — sem mexer em código |

Não há roles de sistema para a cliente: o site público é de leitura + formulário de pedido; apenas o painel `/gestao` exige autenticação (JWT).

### Fluxo principal de um pedido

```
A dona cria uma semana (datas, preço, vagas, menu dos 5 dias) no painel
   ↓
O site público mostra o menu e o estado da semana (aberto/fechado/oculto)
   ↓
A cliente escolhe a fase do ciclo, preenche o formulário → o pedido é gravado na BD
   ↓
O pedido abre o WhatsApp da Colo com a mensagem pronta (confirmação por chat)
   ↓
1 vaga é descontada em transacção; ao chegar a 0, a semana fecha sozinha
   ↓
A dona vê o pedido no painel (/gestao/pedidos) e confirma/cancela
   ↓
Pagamento: Multicaixa Express / transferência (dados editáveis no painel)
```

Pedidos **especiais** (alergias, pedido fora do menu) são uma secção à parte: não descontam vagas, não têm semana associada e vão directos para o WhatsApp da dona.

---

## 2. Modelo de negócio (decidido — não contrariar)

- **Produto único**: pacote semanal — 5 dias × (almoço + sobremesa), preço único para a semana.
- **Preço**: 100 000 Kz/semana no seed (editável por semana no painel).
- **Vagas**: limitadas por semana (6 no seed), descontam automaticamente a cada pedido guardado; a semana fecha sozinha ao chegar a 0.
- **Transição entre semanas**: dois modos alternáveis no painel (página Semanas):
  - **Modo automático** (`modoAutomaticoSemanas = true`, default): a semana activa é a cujo intervalo `[dataInicio, dataFim]` contém hoje (UTC).
  - **Modo manual**: a dona escolhe explicitamente a semana activa (`ativaManual` — só uma de cada vez).
- **Pagamento**: dados de Multicaixa Express / IBAN / Titular editáveis pela dona no painel (informações do site) — **sem gateway de pagamento integrado**; a confirmação é manual, no fluxo do WhatsApp.
- **Mensagem da Colo**: nota semanal carinhosa, editável no painel, exibida no site.
- **Pedidos especiais**: fora do menu (alergias, pedido específico) — secção à parte, não descontam vagas, vão para o WhatsApp da dona.
- **Copy de marca**: deliberadamente emocional ("A Colo não vende refeições. A Colo devolve tempo, tranquilidade e cuidado.") — não substituir por tom funcional sem o Jairo aprovar.

---

## 3. Perfis de utilizador (acessos)

| Área | Acesso | Conteúdo |
|---|---|---|
| Site público (`/`) | Público, sem login | Home com 11 secções (hero, galeria, sobre, fundadora, menu da semana, como funciona, incluído, testemunhos, pedido, citação, nota da Colo) |
| Painel de gestão (`/gestao`) | Login com email + palavra-passe (JWT 7 dias) | Dashboard, Pedidos, Semanas (lista/nova/editor), Informações, Conta |
| Modo edição do site público | Activável no próprio site (AdminFab) | Edição inline de textos e imagens da home, gravada via `/api/edit-content` — ferramenta para a dona ajustar a copy sem código |

Primeira utilização: o painel cria o primeiro administrador no `POST /api/auth/setup` (só funciona enquanto não houver admin — ver `GET /api/auth/setup-needed`).

---

## 4. Regras de negócio-chave (verificadas no código)

### Semanas (`weeks.ts`)
- Uma semana tem obrigatoriamente **5 dias** (`dias: z.array(...).length(5)`), cada dia com `diaSemana` 1–5 (Segunda–Sexta), tema, frase e refeições (`[{tipo: "almoco"|"sobremesa", nome, descricao, foto}]`).
- Estados da semana: `aberto` | `fechado` | `oculto` (oculto esconde o menu do site).
- **Eliminação bloqueada (409)** se a semana já tem pedidos associados.
- Activar manualmente uma semana desactiva todas as outras (numa transacção).
- `toggle-estado` alterna `aberto ↔ fechado` (é assim que a dona abre/encerra pedidos).

### Pedidos (`orders.ts`)
- Tipo `semana`: **a semana activa resolve-se sempre no servidor** (`getActiveWeek`) — o cliente não envia `weekId`.
- Rejeita com **409** se não há semana activa, se o estado não é `aberto` ou se `vagasRestantes <= 0`.
- Cria o pedido e **desconta 1 vaga numa transacção**, fechando a semana automaticamente ao chegar a 0.
- Tipo `especial`: sem semana, sem desconto de vagas, `notas` obrigatório ("Descreve o que precisas.").
- Estados do pedido: `novo` | `confirmado` | `cancelado` (alteráveis pela dona no painel).
- O contacto (WhatsApp da cliente) é gravado e usado para construir a mensagem pré-escrita.

### Site (`site.ts` + `activeWeek.ts`)
- `GET /api/site` devolve `{ config, week }` (config = WhatsApp, Instagram, domínio, moeda, mensagem, pagamento, modo de semanas; week = activa com dias).
- Semana activa por data **em UTC, meia-noite** (consistente em qualquer fuso da máquina).
- Frontend tem **fallback offline** (`data.ts`): timeout de 2,5 s → mostra `defaultWeek`/`defaultConfig`.

### Conteúdo editável (`content.ts`)
- `SiteContent` é um key-value store (`key` → JSON) para textos/imagens da home.
- `GET /api/edit-content` público (para renderizar); `PUT` e `POST /upload` exigem auth.
- `PUT /api/config` (informações do site) é **upsert do payload completo** — reenviar `modoAutomaticoSemanas` ou é reposto ao default `true`.

---

## 5. Decisões importantes já tomadas (resumo)

| Decisão | Valor |
|---|---|
| Base de dados | **SQLite** (ficheiro único) em vez de PostgreSQL — site de baixo tráfego com uma única administradora, evita gerir um servidor de BD na VPS (regra [[wiki/dev/colaboracao-tecnica]]) |
| Modelo de produto | **Pacote semanal único** (5 dias × 2 momentos) em vez de pratos avulsos (pivot 2026-07-02) |
| Refeições por dia | 2 momentos (almoço + sobremesa), simplificado de 4 em 2026-07-03 |
| Pedidos | **Gravados na BD** (não só WhatsApp) para alimentar o dashboard |
| Vagas | Descontam automaticamente; semana fecha sozinha ao chegar a 0 |
| Semanas | Modo automático (por datas) ou manual (`ativaManual`), alternável no painel |
| Pagamento | Dados editáveis (Multicaixa Express/IBAN/Titular) no painel; sem gateway integrado |
| Auth | JWT com expiração de 7 dias (`expiresIn: "7d"`); password com bcryptjs |
| Uploads | Whitelist fechada (.jpg/.jpeg/.png/.webp/.gif) + validação de magic bytes + CSP (`default-src 'none'; img-src 'self'`) — contra XSS via ficheiro disfarçado |
| Frontend | SPA (Vite + React), API **same-origin** em produção (`VITE_API_URL` vazio no `.env.production`) |
| Modo edição | Editável pelo AdminFab no site público — ferramenta de autogestão da dona |
| Desenvolvido por | Muds (crédito no rodapé) |

---

## 6. Fora de âmbito desta versão

Gateway de pagamento online integrado (o pagamento é manual via dados exibidos) · rastreio/gestão de entregas · multi-idioma · contas de cliente com login · catálogo multi-vendedor · app mobile.

O que ficou decidido **não fazer**: reintroduzir pratos avulsos; confiar em `weekId` enviado pelo cliente; aceitar SVG ou formatos fora da whitelist nos uploads.
