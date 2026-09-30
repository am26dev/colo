/**
 * Envio de email. Só o que o Colo precisa: o link de recuperação de
 * palavra-passe.
 *
 * Dois transportes, escolhidos pelo que estiver no ambiente:
 *  - `RESEND_API_KEY`: API HTTP do Resend (sem dependência extra).
 *  - `SMTP_HOST`: qualquer servidor SMTP, via nodemailer — o Brevo
 *    (`smtp-relay.brevo.com`, chave SMTP como utilizador e palavra-passe) ou o
 *    que o Hostinger der, por exemplo, para o domínio já estar lá com o
 *    correio.
 *
 * Escolhe-se um só para não haver duas configurações a divergir. Se nenhum
 * estiver configurado, `emailConfigurado()` é falso e a rota de recuperação
 * recusa-se a criar tokens: assim um deploy a meio não deixa ninguém com a
 * conta trancada e sem saída.
 */

export type Transporte = "resend" | "smtp";

function transporte(): Transporte | null {
  if (process.env.RESEND_API_KEY) return "resend";
  if (process.env.SMTP_HOST) return "smtp";
  return null;
}

/** Há algum transporte de email utilizável? */
export function emailConfigurado(): boolean {
  return transporte() !== null;
}

/** Remetente: `EMAIL_FROM` tem de ser um endereço que o serviço autorize. */
function remetente(): string {
  return process.env.EMAIL_FROM ?? "Colo <nao-responder@colo.ao>";
}

export interface Email {
  para: string;
  assunto: string;
  /** Corpo em texto simples. O HTML sai do mesmo conteúdo, com os parágrafos marcados. */
  texto: string;
  /**
   * HTML próprio, para quando o conteúdo não é só texto: um link tem de ser um
   * `<a href>`, não uma linha com a URL escrita. Sem isto, o link de recuperação
   * chegaria como texto solto, partido a cada ~70 caracteres pelo
   * quoted-printable, e dependia de o cliente adivinhar onde o recomeçar.
   */
  html?: string;
}

async function enviarResend(email: Email): Promise<void> {
  const chave = process.env.RESEND_API_KEY!;
  const resposta = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${chave}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: remetente(),
      to: [email.para],
      subject: email.assunto,
      text: email.texto,
      html: email.html ?? paraHtml(email.texto, email.assunto),
    }),
  });
  if (!resposta.ok) {
    throw new Error(`Resend respondeu ${resposta.status}: ${(await resposta.text()).slice(0, 300)}`);
  }
}

async function enviarSmtp(email: Email): Promise<void> {
  // Importado só quando é preciso: uma instalação sem SMTP não paga o custo
  // de ter o nodemailer carregado.
  const { createTransport } = await import("nodemailer");
  const transporteSmtp = createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true" || Number(process.env.SMTP_PORT) === 465,
    auth:
      process.env.SMTP_USER && process.env.SMTP_PASS
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
  });
  await transporteSmtp.sendMail({
    from: remetente(),
    to: email.para,
    subject: email.assunto,
    text: email.texto,
    html: email.html ?? paraHtml(email.texto, email.assunto),
  });
}

/**
 * Envia o email. Devolve `true` se foi aceite pelo serviço.
 *
 * Não lança: quem chama decide o que fazer com a falha, e no caso da
 * recuperação de senha uma falha de envio não pode ser distinguida de um
 * email que não existe.
 */
export async function enviarEmail(email: Email): Promise<boolean> {
  const alvo = transporte();
  if (!alvo) {
    console.error("[email] nenhum transporte configurado (RESEND_API_KEY ou SMTP_HOST)");
    return false;
  }
  try {
    if (alvo === "resend") await enviarResend(email);
    else await enviarSmtp(email);
    console.log(`[email] enviado para ${email.para} via ${alvo}`);
    return true;
  } catch (erro) {
    console.error(`[email] falhou via ${alvo}:`, erro instanceof Error ? erro.message : erro);
    return false;
  }
}

/** Texto simples -> HTML simples, sem template nem dependências. */
function paraHtml(texto: string, assunto: string): string {
  const paragrafos = texto
    .trim()
    .split("\n\n")
    .map((p) => `<p style="margin:0 0 14px">${escaparHtml(p).replace(/\n/g, "<br>")}</p>`)
    .join("");
  return `<!doctype html><html lang="pt-PT"><body style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;font-size:16px;line-height:1.5;color:#2b2018;background:#faf7f2;padding:24px"><div style="max-width:520px;margin:0 auto;background:#fff;border:1px solid #e8ded0;border-radius:12px;padding:28px"><h1 style="margin:0 0 18px;font-size:19px">${escaparHtml(assunto)}</h1>${paragrafos}</div></body></html>`;
}

function escaparHtml(texto: string): string {
  return texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
