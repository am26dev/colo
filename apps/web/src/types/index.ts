export type MenuEstado = "aberto" | "fechado" | "oculto";
export type TipoRefeicao = "almoco" | "sobremesa";
export type OrderTipo = "semana" | "especial";
export type OrderEstado = "novo" | "confirmado" | "cancelado" | "expirado";

export interface Refeicao {
  tipo: TipoRefeicao;
  nome: string;
  descricao: string;
  foto: string;
}

export interface Day {
  diaSemana: number; // 1=Segunda … 5=Sexta
  tema: string;
  // icone: string;
  frase: string;
  refeicoes: Refeicao[];
}

export interface Week {
  id: string;
  dataInicio: string;
  dataFim: string;
  precoSemanal: number;
  estado: MenuEstado;
  vagasTotais: number;
  /** Vagas confirmadas. No painel é este o número que interessa. */
  vagasRestantes: number;
  /** Lugares prometidos a reservas por confirmar (só no payload público). */
  reservasPendentes?: number;
  /** Confirmadas + reservadas: o que o site pode ainda vender. */
  vagasDisponiveis?: number;
  dias: Day[];
}

export interface WeekListItem extends Week {
  _count?: { pedidos: number };
  ativaManual?: boolean;
}

export interface PagamentoItem {
  etiqueta: string;
  valor: string;
}

export interface SiteConfig {
  whatsapp: string;
  instagram: string;
  dominio: string;
  moeda: string;
  mensagemDaSemana: string;
  pagamento: PagamentoItem[];
  modoAutomaticoSemanas?: boolean;
}

export interface SitePayload {
  config: SiteConfig;
  week: Week | null;
}

export interface Order {
  id: string;
  weekId: string | null;
  tipo: OrderTipo;
  nome: string;
  contacto: string;
  ciclo: string;
  notas: string;
  estado: OrderEstado;
  createdAt: string;
  /** Até quando a reserva bloqueia lugar. Null se não for uma reserva viva. */
  expiresAt?: string | null;
  week?: { dataInicio: string; dataFim: string } | null;
}

export interface DashboardSummary {
  semanaAtiva: {
    id: string;
    dataInicio: string;
    dataFim: string;
    estado: MenuEstado;
    vagasTotais: number;
    vagasRestantes: number;
  } | null;
  pedidosSemanaAtiva: number;
  pedidosNovos: number;
  totalPedidos: number;
}
