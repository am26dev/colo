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
     Cada prato é um bloco { ... }. Mantém as vírgulas entre blocos.    */
  pratos: [
    {
      nome: "Salmão com quinoa e legumes assados",
      descricao: "Salmão grelhado sobre quinoa, brócolos e batata-doce. Rico em ómega-3 — ideal para os dias do ciclo.",
      preco: 8500,
      tags: ["Anti-inflamatória", "Rica em proteína"],
      foto: ""   // ex.: "assets/img/salmao.jpg"
    },
    {
      nome: "Frango do campo com batata-doce",
      descricao: "Frango temperado com ervas, batata-doce assada e brócolos no vapor. Energia que dura o dia todo.",
      preco: 7000,
      tags: ["Nutritiva", "Mais energia"],
      foto: ""
    },
    {
      nome: "Buddha bowl da Colo",
      descricao: "Grão-de-bico, abacate, legumes salteados e molho de tahine sobre arroz integral. Para os dias sem carne.",
      preco: 6500,
      tags: ["Vegetariana", "Apoio ao ciclo"],
      foto: ""
    },
    {
      nome: "Caldeirada leve de peixe",
      descricao: "Peixe branco estufado com tomate, courgette e batata, em caldo suave. A comida que abraça.",
      preco: 7500,
      tags: ["Conforto", "Leve"],
      foto: ""
    },
    {
      nome: "Bowl de lentilhas com abóbora",
      descricao: "Lentilhas, arroz integral, abóbora assada e espinafres. Ferro e fibra para a fase menstrual.",
      preco: 6000,
      tags: ["Vegetariana", "Apoio ao ciclo"],
      foto: ""
    },
    {
      nome: "Creme de abóbora com gengibre e cúrcuma",
      descricao: "Creme aveludado de abóbora com gengibre e cúrcuma. Quente, anti-inflamatório e que reduz o inchaço.",
      preco: 4500,
      tags: ["Anti-inflamatória", "Reduz inchaço"],
      foto: ""
    }
  ]
};
