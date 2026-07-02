/**
 * Fonte única do conteúdo estático institucional do site Colo (nunca muda
 * sem deploy) + os defaults de fallback usados quando a API está em baixo.
 * Conteúdo dinâmico (semana activa, vagas, estado, contactos, pagamento,
 * mensagem) vive na base de dados e é lido via useSiteContent.
 */
import type { SiteConfig, TipoRefeicao, Week } from "../types";

export const site = {
  nome: "Colo",
  slogan: "Comida que cuida de ti",
  descricao:
    "Colo: comida pensada na mulher. O pacote semanal que cuida de ti — pequeno-almoço, almoço, lanche e jantar, todos os dias úteis. Angola.",
  desenvolvidoPor: { nome: "Muds", url: "https://muds.ao" },
};

export const nav = [
  { href: "#sobre", label: "Sobre" },
  { href: "#menu", label: "Menu da semana" },
  { href: "#como-funciona", label: "Como funciona" },
  { href: "#pedido", label: "Fazer pedido", cta: true },
];

export const hero = {
  titulo: "Comida que ",
  tituloDestaque: "cuida",
  tituloFim: " de ti.",
  lead: "Nem sempre conseguimos tirar peso aos teus dias. Mas podemos tirar o peso de pensar nas refeições — pequeno-almoço, almoço, lanche e jantar, pensados para ti todas as semanas.",
  cta1: "Ver o menu da semana",
  cta2: "Falar no WhatsApp",
  selo: { linha1: "Feita com", linha2: "intenção, sabor", linha3: "e cuidado" },
  fotoAlt: "Taça de quinoa com legumes assados da Colo",
};

export const sobre = {
  eyebrow: "A Colo",
  titulo: "O abraço que acolhe.",
  lead: "Enquanto cuidas de tudo à tua volta, deixa-nos cuidar desta parte de ti. A Colo não vende refeições — devolve-te tempo, tranquilidade e cuidado, uma semana de cada vez.",
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
  eyebrow: "Menu da semana",
  titulo: "As refeições desta semana",
  subtitulo:
    "Cada prato foi pensado para nutrir o teu corpo, respeitar o teu ritmo e transformar a hora da refeição num pequeno momento de cuidado.",
  precoLabel: "Preço da semana",
  precoNota: "Inclui pequeno-almoço, almoço, lanche e jantar de Segunda a Sexta.",
  nota: "O menu pode ser adaptado à fase do teu ciclo — indica-o no pedido. 💛",
};

export const comoFunciona = {
  eyebrow: "Como funciona",
  titulo: "Simples, todas as semanas.",
  passos: [
    { n: 1, titulo: "Vês o menu", texto: "Publicamos o menu da semana com as 4 refeições de cada dia, Segunda a Sexta." },
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
  "pequeno-almoco": "Pequeno-almoço",
  almoco: "Almoço",
  lanche: "Lanche",
  jantar: "Jantar",
};

export const refeicaoOrdem: TipoRefeicao[] = ["pequeno-almoco", "almoco", "lanche", "jantar"];

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
  dataInicio: "2026-06-29",
  dataFim: "2026-07-03",
  precoSemanal: 100000,
  estado: "aberto",
  vagasTotais: 6,
  vagasRestantes: 6,
  dias: [
    {
      diaSemana: 1,
      tema: "Leveza & Frescura",
      icone: "🌿",
      frase: "Começar a semana com carinho é também uma forma de cuidar de ti.",
      refeicoes: [
        { tipo: "pequeno-almoco", nome: "Papas de aveia com fruta", descricao: "Aveia cozida com leite vegetal, canela e fruta fresca da época.", foto: "" },
        { tipo: "almoco", nome: "Febras com ananás, bacon e cuscuz", descricao: "Febras grelhadas com ananás e bacon, servidas com cuscuz temperado.", foto: "" },
        { tipo: "lanche", nome: "Iogurte com granola", descricao: "Iogurte natural com granola caseira e mel.", foto: "" },
        { tipo: "jantar", nome: "Panna cotta de coco com compota de frutos vermelhos", descricao: "Sobremesa cremosa de coco com compota caseira de frutos vermelhos.", foto: "" },
      ],
    },
    {
      diaSemana: 2,
      tema: "Energia & Estrutura",
      icone: "🔥",
      frase: "Que encontres nesta refeição um momento de pausa no meio da correria.",
      refeicoes: [
        { tipo: "pequeno-almoco", nome: "Torrada integral com abacate", descricao: "Pão integral tostado com abacate amassado e sementes.", foto: "" },
        { tipo: "almoco", nome: "Salmão com molho de laranja", descricao: "Salmão grelhado com um molho cítrico de laranja e ervas.", foto: "" },
        { tipo: "lanche", nome: "Fruta da época", descricao: "Seleção de fruta fresca da época.", foto: "" },
        { tipo: "jantar", nome: "Bolo gelado de Nido", descricao: "Sobremesa gelada e cremosa à base de leite Nido.", foto: "" },
      ],
    },
    {
      diaSemana: 3,
      tema: "Nutrição Vegetal",
      icone: "🌸",
      frase: "Há dias em que o maior gesto de amor é sentarmo-nos à mesa e respirar.",
      refeicoes: [
        { tipo: "pequeno-almoco", nome: "Smoothie verde", descricao: "Batido de espinafres, banana, maçã e gengibre.", foto: "" },
        { tipo: "almoco", nome: "Charuto de repolho recheado com carne moída", descricao: "Folhas de repolho recheadas com carne moída temperada.", foto: "" },
        { tipo: "lanche", nome: "Bolachas de aveia", descricao: "Bolachas caseiras de aveia e mel.", foto: "" },
        { tipo: "jantar", nome: "Mousse de frutos vermelhos", descricao: "Mousse leve de frutos vermelhos frescos.", foto: "" },
      ],
    },
    {
      diaSemana: 4,
      tema: "Conforto & Presença",
      icone: "🕯️",
      frase: "Acreditamos que cuidar de ti também pode começar à mesa.",
      refeicoes: [
        { tipo: "pequeno-almoco", nome: "Ovos mexidos com legumes", descricao: "Ovos mexidos com tomate, espinafres e ervas frescas.", foto: "" },
        { tipo: "almoco", nome: "Peixe \"frito\" com banana-pão na manteiga e vinagrete de feijão", descricao: "Peixe assado com banana-pão salteada e vinagrete de feijão.", foto: "" },
        { tipo: "lanche", nome: "Mix de frutos secos", descricao: "Mistura de castanhas, amêndoas e passas.", foto: "" },
        { tipo: "jantar", nome: "Bolinho de tâmaras", descricao: "Bolinhos energéticos de tâmaras e coco.", foto: "" },
      ],
    },
    {
      diaSemana: 5,
      tema: "Equilíbrio & Encerramento",
      icone: "🌙",
      frase: "Termina a semana com leveza. O teu corpo agradece e a tua mente também.",
      refeicoes: [
        { tipo: "pequeno-almoco", nome: "Panquecas de banana", descricao: "Panquecas leves de banana e aveia.", foto: "" },
        { tipo: "almoco", nome: "Frango com puré de cenoura", descricao: "Frango assado com puré cremoso de cenoura e ervas.", foto: "" },
        { tipo: "lanche", nome: "Chá e fruta seca", descricao: "Chá de ervas com uma seleção de fruta seca.", foto: "" },
        { tipo: "jantar", nome: "Quinoa doce", descricao: "Quinoa cozida com leite de coco, canela e fruta.", foto: "" },
      ],
    },
  ],
};
