/* =========================================================
   COLO — MENU DA SEMANA
   ---------------------------------------------------------
   👉 ESTE É O FICHEIRO QUE ATUALIZAS TODAS AS QUINTAS-FEIRAS.
   Vê o passo a passo em GUIA-ATUALIZAR-MENU.md
   ========================================================= */

window.COLO_MENU = {

  /* Datas da semana (texto livre, como queres que apareça) */
  semana: "23 a 27 de junho",

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
      nome: "Salmão com quinoa e legumes",
      descricao: "Salmão grelhado, quinoa, brócolos e batata-doce assada. Anti-inflamatório e rico em ómega-3.",
      preco: 8500,
      tags: ["Anti-inflamatória", "Rica em proteína"],
      foto: ""   // ex.: "assets/img/salmao.jpg"
    },
    {
      nome: "Frango do campo com arroz integral",
      descricao: "Frango temperado com ervas, arroz integral e salada verde da estação. Leve e nutritivo.",
      preco: 7000,
      tags: ["Nutritiva", "Leve"],
      foto: ""
    },
    {
      nome: "Buddha bowl da Colo",
      descricao: "Grão-de-bico, abacate, legumes salteados e molho de tahine. Para os dias sem carne.",
      preco: 6500,
      tags: ["Vegetariana", "Apoio ao ciclo"],
      foto: ""
    }
  ]
};
