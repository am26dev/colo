/* =========================================================
   COLO — MENU DA SEMANA
   ---------------------------------------------------------
   👉 ESTE É O FICHEIRO QUE ATUALIZAS TODAS AS QUINTAS-FEIRAS.
   Vê o passo a passo em GUIA-ATUALIZAR-MENU.md
   ========================================================= */

window.COLO_MENU = {

  /* Datas da semana (texto livre, como queres que apareça) */
  semana: "22 a 26 de junho",

  /* Estado dos pedidos:
     "aberto"   -> as pessoas podem encomendar
     "fechado"  -> menu visível, mas pedidos encerrados                */
  estado: "aberto",

  /* Vagas da semana (limite de pedidos). Quando as vagas restantes
     chegam a 0, os pedidos fecham automaticamente.                    */
  vagasTotais: 6,
  vagasRestantes: 6,

  /* --- PRATOS ---
     Acrescenta, remove ou edita pratos à vontade.
     Cada prato é um bloco { ... }. Mantém as vírgulas entre blocos.
     O campo "foto" aponta para uma imagem em assets/img/.             */
  pratos: [
    {
      nome: "Salmão assado com batata e feijão-verde",
      descricao: "Salmão no forno com ervas, batata corada e feijão-verde. Rico em ómega-3 — um miminho para os dias do ciclo.",
      preco: 8500,
      tags: ["Anti-inflamatória", "Rica em proteína"],
      foto: "assets/img/salmao.jpg"
    },
    {
      nome: "Frango grelhado com salada da época",
      descricao: "Frango do campo grelhado sobre salada fresca, tomate e parmesão. Energia leve que dura o dia todo.",
      preco: 7000,
      tags: ["Nutritiva", "Mais energia"],
      foto: "assets/img/frango.jpg"
    },
    {
      nome: "Buddha bowl da Colo",
      descricao: "Abóbora assada, grão-de-bico, abacate, espinafres e quinoa com um fio de limão. Para os dias sem carne.",
      preco: 6500,
      tags: ["Vegetariana", "Apoio ao ciclo"],
      foto: "assets/img/buddha.jpg"
    },
    {
      nome: "Couve-flor assada com quinoa",
      descricao: "Bifes de couve-flor assada com ervas, quinoa e molho cremoso de iogurte e limão. Leve e reconfortante.",
      preco: 6000,
      tags: ["Vegetariana", "Leve"],
      foto: "assets/img/couveflor.jpg"
    },
    {
      nome: "Creme de abóbora com gengibre e cúrcuma",
      descricao: "Creme aveludado de abóbora com gengibre e cúrcuma, sementes tostadas e tomilho. Anti-inflamatório e que reduz o inchaço.",
      preco: 4500,
      tags: ["Anti-inflamatória", "Reduz inchaço"],
      foto: "assets/img/creme-abobora.jpg"
    },
    {
      nome: "Sopa cremosa de tomate e manjericão",
      descricao: "Tomate assado lentamente com alho e manjericão fresco. A comida que abraça, quentinha e leve.",
      preco: 4500,
      tags: ["Conforto", "Anti-inflamatória"],
      foto: "assets/img/sopa-tomate.jpg"
    }
  ]
};
