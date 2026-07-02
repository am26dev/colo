import { fmtIntervaloSemana, fmtPreco } from "./format";

export function whatsappLink(whatsapp: string, texto?: string): string {
  const num = (whatsapp || "").replace(/\D/g, "");
  const base = `https://wa.me/${num}`;
  return texto ? `${base}?text=${encodeURIComponent(texto)}` : base;
}

interface SemanaResumo {
  dataInicio: string;
  dataFim: string;
  precoSemanal: number;
}

export interface PedidoInput {
  semana: SemanaResumo;
  nome: string;
  contacto: string;
  ciclo: string;
  notas: string;
}

export function montarMensagemPedido(input: PedidoInput, moeda: string): string {
  const linhas: string[] = [];
  linhas.push("Olá Colo! Quero cuidar de mim esta semana. 💛", "");
  linhas.push(`Semana: ${fmtIntervaloSemana(input.semana.dataInicio, input.semana.dataFim)}`);
  linhas.push(`Nome: ${input.nome}`);
  linhas.push(`Contacto: ${input.contacto}`);
  linhas.push(`Menu semanal: ${fmtPreco(input.semana.precoSemanal, moeda)}`);
  if (input.ciclo) linhas.push("", `Fase do ciclo: ${input.ciclo}`);
  if (input.notas) linhas.push(`Notas: ${input.notas}`);
  return linhas.join("\n");
}

export function montarMensagemComprovativo(nome: string, semana: Pick<SemanaResumo, "dataInicio" | "dataFim"> | null): string {
  let msg = "Olá Colo! 💛 Aqui está o comprovativo do meu pagamento.";
  if (nome) msg += ` (${nome})`;
  msg += `\nSemana: ${semana ? fmtIntervaloSemana(semana.dataInicio, semana.dataFim) : "—"}`;
  return msg;
}

export function montarMensagemHero(semana: Pick<SemanaResumo, "dataInicio" | "dataFim"> | null): string {
  const intervalo = semana ? fmtIntervaloSemana(semana.dataInicio, semana.dataFim) : "";
  return `Olá Colo! Vi o menu${intervalo ? " da semana de " + intervalo : ""} e queria saber mais. 💛`;
}

export function montarMensagemPedidoEspecial(nome: string, contacto: string, notas: string): string {
  const linhas: string[] = [];
  linhas.push("Olá Colo! Tenho um pedido especial. 💛", "");
  linhas.push(`Nome: ${nome}`);
  linhas.push(`Contacto: ${contacto}`);
  linhas.push("", `Pedido: ${notas}`);
  return linhas.join("\n");
}
