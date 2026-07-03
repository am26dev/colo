import type { SiteConfig, TipoRefeicao, Week } from "../types";

export const site = {
  nome: "Colo",
  slogan: "Comida que cuida de ti",
  descricao:
    "Colo: comida pensada na mulher. O pacote semanal que cuida de ti — almoço e momento doce, todos os dias úteis. Angola.",
  desenvolvidoPor: { nome: "Muds", url: "https://muds.ao" },
};

export const nav = [
  { href: "#sobre", label: "Sobre" },
  { href: "#menu", label: "As refeições desta semana" },
  { href: "#como-funciona", label: "Como funciona" },
  { href: "#pedido", label: "Fazer pedido", cta: true },
];

export const hero = {
  titulo: "Comida que ",
  tituloDestaque: "cuida",
  tituloFim: " de ti.",
  lead: "Nem sempre conseguimos tirar peso aos teus dias. Mas podemos tirar o peso de pensar no almoço.",
  cta1: "Ver o menu da semana",
  cta2: "Falar no WhatsApp",
  selo: { linha1: "Feita com", linha2: "intenção, sabor", linha3: "e cuidado" },
  fotoAlt: "Taça de quinoa com legumes assados da Colo",
};

export const sobre = {
  eyebrow: "A Colo",
  titulo: "O abraço que acolhe.",
  lead: "Enquanto cuidas de tudo à tua volta, deixa-nos cuidar desta parte de ti. A Colo não vende refeições. A Colo devolve tempo, tranquilidade e cuidado.",
  frase: "Comida que abraça. Feita com intenção.",
  fotoAlt: "Uma refeição quente da Colo, pensada para cuidar de ti",
  pilares: [
    {
      icon: "🤍",
      titulo: "Redução de inchaço",
      texto: "Ingredientes anti-inflamatórios que ajudam o corpo a sentir-se mais leve.",
    },
    {
      icon: "🌙",
      titulo: "Apoio ao ciclo menstrual",
      texto: "O menu adapta-se à fase em que estás, dando ao corpo o que ele pede.",
    },
    {
      icon: "🌿",
      titulo: "Mais energia e bem-estar",
      texto: "Comida nutritiva e saborosa para teres mais disposição no dia a dia.",
    },
  ],
};

export const menuSecao = {
  eyebrow: "As refeições desta semana",
  titulo: "As refeições desta semana",
  subtitulo:
    "Cada prato foi pensado para nutrir o teu corpo, respeitar o teu ritmo e transformar a hora da refeição num pequeno momento de cuidado.",
  precoLabel: "Preço da semana",
  precoNota: "Inclui almoço e momento doce de Segunda a Sexta.",
  nota: "O menu pode ser adaptado à fase do teu ciclo — indica-o no pedido. 💛",
};

export const comoFunciona = {
  eyebrow: "Como funciona",
  titulo: "Simples, todas as semanas.",
  passos: [
    { n: 1, titulo: "Vês o menu", texto: "Publicamos o menu da semana com almoço e momento doce de cada dia, Segunda a Sexta." },
    { n: 2, titulo: "Escolhes este menu", texto: "Um só pacote, um só preço para a semana toda — pedes num só toque pelo WhatsApp." },
    { n: 3, titulo: "Pagas com Multicaixa Express", texto: "Confirmas o pagamento por Multicaixa Express ou transferência." },
    { n: 4, titulo: "Recebes as tuas refeições", texto: "As vagas da semana são limitadas — quando enchem, fechamos os pedidos." },
  ],
};

export const cicloOpcoes = [
  { value: "", label: "Prefiro não indicar" },
  { value: "Menstrual", label: "Menstrual" },
  { value: "Folicular", label: "Folicular" },
  { value: "Ovulatória", label: "Ovulatória" },
  { value: "Lútea", label: "Lútea" },
];

export const pedidoSecao = {
  eyebrow: "O teu pedido",
  titulo: "Reserva o menu desta semana.",
  texto:
    "Preenche os teus dados e envia. O pedido chega-nos diretamente pelo WhatsApp e respondemos com os detalhes de pagamento por Multicaixa Express.",
  submitLabel: "Quero cuidar de mim esta semana",
  submitHint: "Abre o WhatsApp com o teu pedido já escrito. É só enviares. 💛",
  comprovativoLabel: "📤 Enviar comprovativo pelo WhatsApp",
  comprovativoHint: "Abre o WhatsApp da Colo para enviares a imagem do comprovativo.",
  confirmacao: {
    titulo: "Obrigada, com carinho 💛",
    texto:
      "Obrigada por confiares no Colo. A partir de agora, nós tratamos das refeições. Tu tratas de encontrar alguns minutos para ti. Mal podemos esperar para fazer parte da tua semana.",
    cta: "Fazer outro pedido",
  },
};

export const pedidoEspecialSecao = {
  eyebrow: "Pedido especial",
  titulo: "Precisas de algo fora do menu?",
  texto: "Conta-nos o que precisas — alergias, preferências especiais ou um pedido só teu. Respondemos pelo WhatsApp.",
  submitLabel: "Enviar pedido especial",
  placeholderNotas: "Descreve o que precisas…",
};

export const footerStrip = ["Acolhimento", "Nutrição real", "Feminino", "Leveza", "Presença"];

export const refeicaoLabels: Record<TipoRefeicao, string> = {
  almoco: "Almoço",
  sobremesa: "Momento doce",
};

export const refeicaoOrdem: TipoRefeicao[] = ["almoco", "sobremesa"];

export const diasSemanaLabels: Record<number, string> = {
  1: "Segunda-feira",
  2: "Terça-feira",
  3: "Quarta-feira",
  4: "Quinta-feira",
  5: "Sexta-feira",
};

/** Fallback quando a API está indisponível — espelha o seed inicial da BD. */
export const defaultConfig: SiteConfig = {
  whatsapp: "244924644918",
  instagram: "https://instagram.com/coloangola",
  dominio: "colo.ao",
  moeda: "Kz",
  mensagemDaSemana:
    "Esta semana pensei em ti que andas mais cansada. Trouxe pratos quentes, com gengibre e cúrcuma, para acalmar o corpo e reduzir o inchaço. Come devagar, sem pressa. A Colo cuida de ti — começa pelo prato. 💛",
  pagamento: [
    { etiqueta: "Multicaixa Express", valor: "923 000 000" },
    { etiqueta: "IBAN", valor: "AO06 0000 0000 0000 0000 0000 0" },
    { etiqueta: "Titular", valor: "Nome da Titular" },
  ],
  modoAutomaticoSemanas: true,
};

export const defaultWeek: Week = {
  id: "fallback",
  dataInicio: "2026-07-06",
  dataFim: "2026-07-10",
  precoSemanal: 100000,
  estado: "aberto",
  vagasTotais: 6,
  vagasRestantes: 6,
  dias: [
    {
      diaSemana: 1,
      tema: "Leveza & Frescura",
      icone: "🌿",
      frase: "Que esta refeição te lembre que cuidar de ti também passa pelos pequenos momentos.",
      refeicoes: [
        { tipo: "almoco", nome: "Beringela recheada com linguiça e salada verde", descricao: "Beringela assada recheada com linguiça e servida com salada verde fresca.", foto: "" },
        { tipo: "sobremesa", nome: "Overnight oats", descricao: "Aveia hidratada durante a noite com iogurte e fruta.", foto: "" },
      ],
    },
    {
      diaSemana: 2,
      tema: "Energia & Estrutura",
      icone: "🔥",
      frase: "Às vezes, tudo o que precisamos é de uma pausa à mesa.",
      refeicoes: [
        { tipo: "almoco", nome: "Ganso ao molho de vinho tinto e alecrim com cuscuz", descricao: "Ganso cozinhado lentamente em vinho tinto e alecrim, servido com cuscuz.", foto: "" },
        { tipo: "sobremesa", nome: "Mousse de abacate", descricao: "Mousse cremosa de abacate com cacau.", foto: "" },
      ],
    },
    {
      diaSemana: 3,
      tema: "Nutrição Vegetal",
      icone: "🌸",
      frase: "O conforto também pode nascer dos ingredientes mais simples.",
      refeicoes: [
        { tipo: "almoco", nome: "Cannelloni de curgete recheado com ricota e cogumelos", descricao: "Fatias de curgete enroladas com ricota e cogumelos, gratinadas.", foto: "" },
        { tipo: "sobremesa", nome: "Bolinho Banoffee", descricao: "Bolinho de banana, caramelo e natas.", foto: "" },
      ],
    },
    {
      diaSemana: 4,
      tema: "Conforto & Presença",
      icone: "🕯️",
      frase: "Porque cada refeição pode ser um gesto de carinho contigo.",
      refeicoes: [
        { tipo: "almoco", nome: "Estrogonofe de frango com bulgur", descricao: "Frango ao molho cremoso servido com bulgur.", foto: "" },
        { tipo: "sobremesa", nome: "Bolo de amêndoa", descricao: "Bolo húmido de amêndoa.", foto: "" },
      ],
    },
    {
      diaSemana: 5,
      tema: "Equilíbrio & Encerramento",
      icone: "🌙",
      frase: "Termina a semana com o cuidado que mereces.",
      refeicoes: [
        { tipo: "almoco", nome: "Cestinhos de banana-pão com atum e legumes grelhados", descricao: "Cestinhos de banana-pão recheados com atum e legumes grelhados.", foto: "" },
        { tipo: "sobremesa", nome: "Cocada cremosa", descricao: "Cocada cremosa de coco.", foto: "" },
      ],
    },
  ],
};
