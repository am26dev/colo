# Colo — *Comida que cuida de ti* 🤍

> 🌐 **No ar:** https://am26dev.github.io/colo/

Micro-site (landing page) da marca **Colo**: comida pensada na mulher — saudável,
anti-inflamatória e personalizada conforme o ciclo menstrual. Mercado: **Angola**.

> Marca angolana · domínio **.ao** · conteúdo em **português de Portugal** · moeda **Kwanza (Kz)**.

---

## ✨ O que faz

- **Página única** e responsiva (telemóvel e computador) com a identidade da Colo.
- **Menu da semana** carregado a partir de um ficheiro simples (`data/menu.js`),
  atualizado **todas as quintas-feiras** para a semana seguinte.
- **Vagas limitadas por semana**: quando enchem (ou quando fechas manualmente),
  o site mostra *“pedidos encerrados”* mas mantém o menu visível.
- **Pedido pelo WhatsApp**: o cliente preenche um formulário e o pedido chega-te
  já escrito ao WhatsApp — é assim que **recebes o “alerta”** de cada interessada.
- **Pagamento por Multicaixa Express** / transferência (dados em `data/config.js`).
- **Personalização por ciclo**: a cliente indica a fase do ciclo no pedido.
- **Mensagem da Colo** (semanal/diária) editável no fundo do site.
- **Partilha** fácil para **Instagram** e **WhatsApp**.

---

## 🗂️ Estrutura

```
colo/
├── index.html               ← a página
├── data/
│   ├── config.js            ← WhatsApp, Instagram, pagamento, mensagem, domínio
│   └── menu.js              ← MENU DA SEMANA (atualizas todas as quintas)
├── assets/
│   ├── css/styles.css       ← visual da marca
│   ├── js/app.js            ← lógica (menu, vagas, pedido WhatsApp)
│   └── img/                 ← fotos e favicon
├── GUIA-ATUALIZAR-MENU.md   ← passo a passo para a dona (sem programar)
└── README.md
```

## 🔧 Antes de publicar — preenche os teus dados

Em **`data/config.js`**:
- `whatsapp` — número com indicativo `244`, só dígitos (ex.: `"244923000000"`).
- `instagram` — link do perfil.
- `pagamento` — Multicaixa Express / IBAN / titular reais.
- `dominio` — o teu domínio `.ao`.
- `mensagemDaSemana` — a tua mensagem.

Em **`data/menu.js`** — o menu da semana (ver **GUIA-ATUALIZAR-MENU.md**).

Fotos opcionais em **`assets/img/`** (ver o README lá dentro).

---

## ▶️ Ver localmente

Como o site é estático, basta abrir o `index.html` no navegador.
Para um ambiente mais fiel, podes correr um servidor simples:

```bash
# com Python instalado
python -m http.server 8000
# depois abre  http://localhost:8000
```

## 🚀 Publicar

Qualquer alojamento estático serve: **Netlify**, **Vercel**, **Cloudflare Pages**
ou **GitHub Pages**. Não precisa de servidor nem base de dados.

O site já está publicado em **GitHub Pages**: https://am26dev.github.io/colo/
(branch `main`, atualiza sozinho a cada `git push`).

### Domínio `.ao`
1. Regista o domínio (ex.: `colo.ao`) junto de um registador angolano.
2. Em **Settings → Pages → Custom domain** do repositório, escreve `colo.ao`
   (isto cria um ficheiro `CNAME` no repo).
3. No teu DNS, aponta o domínio para o GitHub Pages:
   - `A` → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - (ou `CNAME` de `www` → `am26dev.github.io`)
4. Atualiza `dominio` em `data/config.js`.

---

Feito com carinho para a Colo. 💛
