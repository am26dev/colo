import type { Week } from "../types";

export function fmtPreco(v: number | null | undefined, moeda: string): string {
  if (v == null || v === 0) return "";
  return v.toLocaleString("pt-PT") + " " + moeda;
}

const MESES = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

/** "29 de junho a 3 de julho" a partir de duas datas ISO (UTC). */
export function fmtIntervaloSemana(dataInicio: string, dataFim: string): string {
  const inicio = new Date(dataInicio);
  const fim = new Date(dataFim);
  const diaI = inicio.getUTCDate();
  const diaF = fim.getUTCDate();
  const mesI = MESES[inicio.getUTCMonth()];
  const mesF = MESES[fim.getUTCMonth()];
  if (mesI === mesF) return `${diaI} a ${diaF} de ${mesF}`;
  return `${diaI} de ${mesI} a ${diaF} de ${mesF}`;
}

export function vagasRestantes(week: Week): number | null {
  const v = Number(week.vagasRestantes);
  return Number.isNaN(v) ? null : v;
}

export function pedidosAbertos(week: Week): boolean {
  if (week.estado === "fechado" || week.estado === "oculto") return false;
  const v = vagasRestantes(week);
  if (v !== null && v <= 0) return false;
  return true;
}

/**
 * Só deixa passar http(s) — evita que um link editável no painel (ex.: Instagram
 * em config.instagram) vire um href "javascript:" executado no browser da visitante.
 */
export function safeExternalUrl(url: string | null | undefined, fallback = "#"): string {
  if (!url) return fallback;
  try {
    const parsed = new URL(url, window.location.origin);
    return parsed.protocol === "http:" || parsed.protocol === "https:" ? url : fallback;
  } catch {
    return fallback;
  }
}
