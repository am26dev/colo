/* =========================================================
   COLO — CONFIGURAÇÃO DA MARCA
   ---------------------------------------------------------
   Este ficheiro guarda os dados fixos do site.
   Muda só o que está entre aspas. Mantém as vírgulas. 🙂
   ========================================================= */

window.COLO_CONFIG = {

  /* Domínio que vais usar (aparece no rodapé) */
  dominio: "colo.ao",

  /* --- WhatsApp ---
     Número COM indicativo de Angola, só dígitos, sem "+" nem espaços.
     Exemplo para +244 923 000 000  ->  "244923000000"               */
  whatsapp: "244924644918",

  /* Link do Instagram (perfil completo) */
  instagram: "https://instagram.com/coloangola",

  /* --- Pagamento (Multicaixa Express / transferência) ---
     Aparece na secção de pedido. Preenche com os teus dados reais.   */
  pagamento: [
    { etiqueta: "Multicaixa Express", valor: "923 000 000" },
    { etiqueta: "IBAN", valor: "AO06 0000 0000 0000 0000 0000 0" },
    { etiqueta: "Titular", valor: "Nome da Titular" }
  ],

  /* --- Mensagem da Colo (semanal/diária) ---
     Deixa "" para esconder a secção. Escreve algo curto e carinhoso. */
  mensagemDaSemana: "Esta semana escolhi pratos mais leves para acompanhar a fase folicular. Cuida de ti — começa pelo prato. 💛",

  /* Moeda (apenas o símbolo apresentado nos preços) */
  moeda: "Kz"
};
