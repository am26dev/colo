/**
 * Assinatura dos emails do Colo.
 *
 * É a peça que responde a "isto é mesmo do Colo?". Não substitui o avatar que
 * o Gmail mostra ao lado do remetente — esse vem do perfil do remetente junto
 * do Gmail e não o controla nem o Brevo nem este código. O que se controla é o
 * nome, o Reply-To e isto.
 *
 * A assinatura leva o site e o WhatsApp porque a plausível razão de alguém estar
 * a ler um email de recuperação de senha é a de desconfiar dele. Um email que dá
 * um caminho óbvio para confirmar que é legítimo é a defesa mais barata que há.
 */
import { APP_URL } from "./appUrl.js";

/** O que a dona configurou no painel. Lido uma vez por email, sem cache. */
export interface Contactos {
  nome: string;
  whatsapp?: string;
  instagram?: string;
}

function escaparHtml(texto: string): string {
  return texto.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** WhatsApp em Angola: 244 924 644 918 -> 244924644918, como o link exige. */
function numeroWhatsapp(bruto: string): string {
  return bruto.replace(/\D/g, "");
}

export function assinaturaEmail(contactos: Contactos): string {
  const linhas: string[] = [];

  linhas.push(
    `<a href="${escaparHtml(APP_URL)}" style="color:#2b2018;font-weight:600;text-decoration:none;font-size:15px">${escaparHtml(contactos.nome)}</a>`
  );

  const ligacoes: string[] = [`<a href="${escaparHtml(APP_URL)}" style="color:#7a6a5c;text-decoration:none">${escaparHtml(APP_URL.replace(/^https?:\/\//, ""))}</a>`];

  if (contactos.whatsapp) {
    const numero = numeroWhatsapp(contactos.whatsapp);
    if (numero) {
      ligacoes.push(
        `<a href="https://wa.me/${numero}" style="color:#7a6a5c;text-decoration:none">WhatsApp ${escaparHtml(contactos.whatsapp)}</a>`
      );
    }
  }

  if (contactos.instagram) {
    const url = contactos.instagram.replace(/^https?:\/\/(www\.)?instagram\.com\//, "");
    ligacoes.push(
      `<a href="${escaparHtml(contactos.instagram)}" style="color:#7a6a5c;text-decoration:none">@${escaparHtml(url.replace(/\/$/, ""))}</a>`
    );
  }

  linhas.push(ligacoes.join('<span style="color:#c9b8a6">&nbsp;·&nbsp;</span>'));
  linhas.push(
    `<span style="color:#9c8b7c;font-size:12px">Recebeste este email porque pediste uma coisa no teu painel. Se não foste tu, não precisas de fazer nada.</span>`
  );

  return `<div style="margin:28px 0 0;padding-top:18px;border-top:1px solid #e8ded0">${linhas
    .map((l) => `<p style="margin:0 0 6px;font-size:14px;line-height:1.45">${l}</p>`)
    .join("")}</div>`;
}

/**
 * Remetente para as respostas.
 *
 * Sem isto, um "Responder" ia para `nao-responder@colo.ao`, que ninguém lê — e
 * a dona que desconfiou do email fica sem sítio para desfazer a dúvida. A
 * resposta é lida por quem tem a caixa, e essa pessoa pode falar com a dona.
 */
export function emailDeResposta(): string {
  return process.env.EMAIL_REPLY_TO ?? "geral@colo.ao";
}
