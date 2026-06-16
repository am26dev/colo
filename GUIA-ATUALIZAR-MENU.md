# 🍽️ Guia rápido — atualizar o menu (todas as quintas)

Olá! Este guia é para atualizares o menu da semana **sem precisares de saber programar**.
Só vais mexer num ficheiro: **`data/menu.js`**.

---

## 1. Abre o ficheiro do menu
- No GitHub: entra no repositório → pasta **`data`** → clica em **`menu.js`** → clica no **lápis ✏️** (canto superior direito) para editar.

## 2. Muda as datas da semana
```js
semana: "23 a 27 de junho",
```
Escreve as datas da nova semana entre as aspas.

## 3. Define as vagas
```js
vagasTotais: 6,
vagasRestantes: 6,
```
- `vagasTotais` = quantos pedidos aceitas no máximo.
- `vagasRestantes` = quantos ainda estão livres. No início da semana, põe igual ao total.
- À medida que recebes pedidos, podes ir baixando este número.

## 4. Abrir ou fechar pedidos
```js
estado: "aberto",
```
- `"aberto"` → as pessoas podem encomendar.
- `"fechado"` → o menu continua visível, mas com aviso de **pedidos encerrados**.
- 👉 Quando atingires o limite, muda para `"fechado"` (ou põe `vagasRestantes: 0`).

## 5. Editar os pratos
Cada prato é um bloco assim:
```js
{
  nome: "Salmão com quinoa e legumes",
  descricao: "Salmão grelhado, quinoa e legumes da época.",
  preco: 8500,
  tags: ["Anti-inflamatória", "Rica em proteína"],
  foto: ""
},
```
- **nome** e **descricao**: o que quiseres, entre aspas.
- **preco**: só números, sem pontos nem "Kz" (ex.: `8500`).
- **tags**: pequenas etiquetas, separadas por vírgulas.
- **foto**: deixa `""` ou aponta para uma imagem (ver `assets/img/README.md`).
- Para **acrescentar** um prato, copia um bloco inteiro `{ ... }` e cola a seguir, separado por **vírgula**.
- Para **remover**, apaga o bloco `{ ... }` (e a vírgula a mais).

## 6. Guardar
- No GitHub: desce até ao fundo e clica em **Commit changes** (Guardar).
- O site atualiza sozinho em 1–2 minutos.

---

### ⚠️ Cuidados
- Mexe só no que está **entre aspas** e nos **números**.
- Não apagues vírgulas, chavetas `{ }` nem parêntesis retos `[ ]`.
- Se algo correr mal, é só voltar atrás (o GitHub guarda o histórico).

Qualquer dúvida, fala comigo. 💛
