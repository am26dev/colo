import bcrypt from "bcryptjs";
import { Router } from "express";
import { createHash, randomBytes } from "node:crypto";
import { z } from "zod";
import { prisma } from "../db.js";
import { signToken } from "../lib/jwt.js";
import { requireAuth } from "../middleware/auth.js";
import { rateLimit } from "../middleware/rateLimit.js";
import { emailConfigurado, enviarEmail } from "../lib/mailer.js";
import { anexosDoEmail, cabecalhoEmail } from "../lib/emailLogo.js";
import { assinaturaEmail, emailDeResposta, type Contactos } from "../lib/emailAssinatura.js";
import { urlDoSite } from "../lib/appUrl.js";

export const authRouter = Router();

/**
 * Quem é o Colo para efeitos de email: nome e contactos que a dona pôs no
 * painel.
 *
 * Vai ser lido a cada email em vez de guardado: a dona muda o WhatsApp no painel
 * e o email seguinte já sai com o novo, sem ninguém se lembrar de reiniciar
 * nada. Uma configuração que fica desatualizada em silêncio é pior do que
 * nenhuma configuração.
 */
async function identidadeDoColo(): Promise<Contactos> {
  const config = await prisma.siteConfig.findFirst();
  return {
    nome: "Colo",
    whatsapp: config?.whatsapp,
    instagram: config?.instagram,
  };
}

/**
 * `bcrypt.compare` corre em cada tentativa, por isso o login é o alvo óbvio
 * para força bruta. 10 tentativas por 15 minutos por IP trava ataques
 * automatizados sem atrapalhar quem erra a palavra-passe duas ou três vezes.
 */
const loginLimite = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Demasiadas tentativas. Espera alguns minutos e tenta novamente.",
});

/** Só funciona enquanto não existir conta nenhuma (ver rota /setup abaixo). */
const setupLimite = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: "Demasiadas tentativas. Tenta mais tarde.",
});

const setupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

/** Só funciona enquanto não existir nenhuma conta — cria a primeira (a dona). */
authRouter.post("/setup", setupLimite, async (req, res) => {
  const jaExiste = await prisma.admin.findFirst();
  if (jaExiste) {
    res.status(409).json({ erro: "O painel já tem uma conta configurada." });
    return;
  }
  const parsed = setupSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ erro: "Email ou palavra-passe inválidos (mínimo 6 caracteres)." });
    return;
  }
  const { email, password } = parsed.data;
  const passwordHash = await bcrypt.hash(password, 10);
  const admin = await prisma.admin.create({ data: { email: email.toLowerCase(), passwordHash } });
  res.json({ token: signToken({ adminId: admin.id }) });
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

authRouter.post("/login", loginLimite, async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ erro: "Dados inválidos." });
    return;
  }
  const { email, password } = parsed.data;
  const admin = await prisma.admin.findUnique({ where: { email: email.toLowerCase() } });
  if (!admin || !(await bcrypt.compare(password, admin.passwordHash))) {
    res.status(401).json({ erro: "Utilizador ou palavra-passe incorretos." });
    return;
  }
  res.json({ token: signToken({ adminId: admin.id }) });
});

authRouter.get("/setup-needed", async (_req, res) => {
  const jaExiste = await prisma.admin.findFirst();
  res.json({ setupNeeded: !jaExiste });
});

const passwordSchema = z.object({
  atual: z.string().min(1),
  nova: z.string().min(6),
});

authRouter.post("/password", requireAuth, async (req, res) => {
  const parsed = passwordSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ erro: "A nova palavra-passe precisa de pelo menos 6 caracteres." });
    return;
  }
  const admin = await prisma.admin.findUnique({ where: { id: req.adminId } });
  if (!admin || !(await bcrypt.compare(parsed.data.atual, admin.passwordHash))) {
    res.status(401).json({ erro: "A palavra-passe atual está incorreta." });
    return;
  }
  const passwordHash = await bcrypt.hash(parsed.data.nova, 10);
  await prisma.admin.update({ where: { id: admin.id }, data: { passwordHash } });
  res.json({ ok: true });
});

/**
 * Mudança do email de acesso.
 *
 * O email deixou de ser só o nome de utilizador: é também para onde vai o link
 * de recuperação. Se a dona deixa de controlar a inbox — mudou de fornecedor,
 * perdeu o acesso — fica trancada lá fora e a única saída volta a ser quem tem
 * acesso ao servidor. Por isso esta rota existe.
 *
 * A palavra-passe atual é o que prova que é ela: quem chegue ao painel com a
 * sessão aberta não é necessariamente a dona (um navegador partilhado, uma
 * sessão esquecida num portátil). Confirmação por link para o email novo
 * obrigaria a esperar por um email antes de poder mudar de email — paradoxal
 * numa função que se usa justamente quando o email deixou de funcionar.
 */
const emailSchemaMudar = z.object({
  atual: z.string().min(1),
  email: z.string().email(),
});

/**
 * Quem está com a sessão iniciada. A página de conta precisa de mostrar o email
 * atual para a dona poder ver o que está a mudar — e o email é um dado que muda,
 * ao contrário do `adminId` do token, que é imutável. Se o email fosse para o
 * token, a dona teria de sair e voltar a entrar para o ver, e o token ficaria
 * a dizer o endereço antigo.
 */
authRouter.get("/me", requireAuth, async (req, res) => {
  const admin = await prisma.admin.findUnique({
    where: { id: req.adminId },
    select: { email: true },
  });
  if (!admin) {
    res.status(404).json({ erro: "Conta não encontrada." });
    return;
  }
  res.json({ email: admin.email });
});

authRouter.post("/email", requireAuth, async (req, res) => {
  const parsed = emailSchemaMudar.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ erro: "Email inválido." });
    return;
  }
  const admin = await prisma.admin.findUnique({ where: { id: req.adminId } });
  if (!admin || !(await bcrypt.compare(parsed.data.atual, admin.passwordHash))) {
    res.status(401).json({ erro: "A palavra-passe atual está incorreta." });
    return;
  }

  const email = parsed.data.email.toLowerCase();
  if (email === admin.email) {
    res.status(400).json({ erro: "Esse já é o teu email." });
    return;
  }

  // Só há uma conta. Se o email já pertence a alguém, é porque esse alguém é
  // esta mesma conta com o email trocado — ou alguém a tentar ocupar a conta
  // pela porta dos fundos. Recusar é o comportamento seguro em ambos os casos.
  const ocupado = await prisma.admin.findUnique({ where: { email } });
  if (ocupado) {
    res.status(409).json({ erro: "Esse email já está a ser usado." });
    return;
  }

  await prisma.admin.update({ where: { id: admin.id }, data: { email } });

  // Um link de recuperação enviado para o email antigo deixaria de chegar a
  // lado nenhum, e um enviado para o novo provaria que o endereço serve.
  // Não é preciso para a conta funcionar, por isso falhar aqui não desfaz a
  // mudança: avisa-se nos logs e segue-se em frente.
  const identidade = await identidadeDoColo();
  const enviado = await enviarEmail({
    para: email,
    assunto: "O teu email de acesso ao painel da Colo mudou",
    nomeRemetente: identidade.nome,
    resposta: emailDeResposta(),
    texto: [
      "O email de acesso ao teu painel da Colo passou a ser este.",
      "",
      `Agora entras com: ${email}`,
      "",
      "A partir daqui, se te esqueceres da palavra-passe, o link de recuperação vai para este endereço.",
      "",
      "Se não foste tu a fazer esta mudança, muda já a palavra-passe e fala com quem te montou o site.",
      "",
      "—",
      assinaturaTexto(identidade),
    ].join("\n"),
    html: emailAvisoMudanca(email, identidade),
    anexos: anexosDoEmail(),
  });
  if (!enviado) {
    console.error(`[email] aviso de mudança de email para ${email} não saiu; a conta mudou na mesma`);
  }

  res.json({ ok: true });
});

// ---------------------------------------------------------------------------
// Recuperação de palavra-passe.
//
// A dona tem uma única conta e nenhuma forma de recuperar a senha sozinha, o
// que obrigaria o programador a ter acesso permanente ao servidor. Estes
// endpoints dão-lhe essa autonomy: pede um link por email, clica, define uma
// senha nova. O token é de uso único e expira; o pedido responde sempre igual
// para não revelar que emails têm conta.
// ---------------------------------------------------------------------------

/** Um link de recuperação por hora e por IP chega para quem se engana uma vez. */
const recuperarLimite = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: "Pediste demasiado links de recuperação. Espera uma hora e tenta de novo.",
});

/** O token vive uma hora: tempo de sobra para o leer, curto para um link_old virado para a rua. */
const VALIDIDADE_TOKEN_HORAS = 1;

const emailSchema = z.object({
  email: z.string().email(),
});

/** Resposta única para "esse email existe" e "não existe". Não se distingue. */
const RESPOSTA_NEUTRA = "Se esse email tiver uma conta, enviámos um link para escolher uma nova palavra-passe.";

authRouter.post("/recuperar", recuperarLimite, async (req, res) => {
  const parsed = emailSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ erro: "Email inválido." });
    return;
  }

  if (!emailConfigurado()) {
    // Sem email não há como entregar o link. Dizer que sim e não enviar nada
    // seria pior: ela ficaria à espera. Dizer que não, é honesto.
    console.error("[recuperar] email não configurado (falta RESEND_API_KEY ou SMTP_HOST)");
    res.status(503).json({ erro: "A recuperação por email não está disponível. Fala com quem montou o site." });
    return;
  }

  const email = parsed.data.email.toLowerCase();
  const admin = await prisma.admin.findUnique({ where: { email } });

  if (admin) {
    // Um pedido novo invalida os anteriores: o link mais recente é o único
    // que funciona, o que impede que um email antigo encontre-se válido.
    await prisma.passwordResetToken.updateMany({
      where: { adminId: admin.id, usedAt: null },
      data: { usedAt: new Date() },
    });

    const token = randomBytes(32).toString("base64url");
    const criado = await prisma.passwordResetToken.create({
      data: {
        adminId: admin.id,
        tokenHash: sha256(token),
        expiresAt: new Date(Date.now() + VALIDIDADE_TOKEN_HORAS * 60 * 60 * 1000),
      },
    });

    const link = urlDoSite(`/gestao/nova-senha?token=${token}`);
    const identidade = await identidadeDoColo();
    const enviado = await enviarEmail({
      para: admin.email,
      assunto: "Recuperar a tua palavra-passe — Colo",
      nomeRemetente: identidade.nome,
      resposta: emailDeResposta(),
      texto: [
        "Olá! Pediste para escolher uma nova palavra-passe do teu painel da Colo.",
        "",
        "Clica aqui para a definires:",
        "",
        link,
        "",
        `O link só funciona uma vez e expira em ${VALIDIDADE_TOKEN_HORAS} hora.`,
        "",
        "Se não foste tu a pedir isto, não precisas de fazer nada: fica como está.",
        "",
        "—",
        assinaturaTexto(identidade),
      ].join("\n"),
      // A URL vai escondida em `href` e o botão é o que se vê. Assim não há
      // link escrito à mão para o cliente partir ao meio nem para o
      // destinatário copiar a torto.
      html: emailRecuperacao(link, VALIDIDADE_TOKEN_HORAS, identidade),
      anexos: anexosDoEmail(),
    });

    if (!enviado) {
      // O serviço falhou. Deixar o token criado seria o pior dos mundos: ela
      // ficaria à espera de um email que nunca chega, sem o saber. Apaga-se.
      await prisma.passwordResetToken.delete({ where: { id: criado.id } });
      console.error(`[recuperar] email não saiu para ${admin.email}; token descartado`);
    }
  }

  res.json({ ok: true, mensagem: RESPOSTA_NEUTRA });
});

const tokenSchema = z.object({
  token: z.string().min(20).max(200),
});

/** Procura um token vivo: não usado, dentro do prazo. */
async function tokenValido(token: string) {
  return prisma.passwordResetToken.findFirst({
    where: {
      tokenHash: sha256(token),
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
  });
}

/** O formulário pergunta se o link ainda é bom antes de mostrar os campos. */
authRouter.get("/recuperar/validar", async (req, res) => {
  const parsed = tokenSchema.safeParse({ token: req.query.token });
  if (!parsed.success) {
    res.status(400).json({ erro: "Link inválido." });
    return;
  }
  const token = await tokenValido(parsed.data.token);
  if (!token) {
    res.status(410).json({ erro: "Este link já não é válido. Pede um novo." });
    return;
  }
  res.json({ ok: true });
});

const novaSenhaSchema = z.object({
  token: z.string().min(20).max(200),
  nova: z.string().min(6),
});

authRouter.post("/recuperar/definir", async (req, res) => {
  const parsed = novaSenhaSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ erro: "A nova palavra-passe precisa de pelo menos 6 caracteres." });
    return;
  }

  const token = await tokenValido(parsed.data.token);
  if (!token) {
    res.status(410).json({ erro: "Este link já não é válido. Pede um novo." });
    return;
  }

  const passwordHash = await bcrypt.hash(parsed.data.nova, 10);
  // Marcar usado e trocar a senha na mesma transacção: se a escrita da senha
  // falhasse, o link continuaria vivo para nova tentativa; se a marcação falhasse,
  // o link ficaria consumido sem a senha ter mudado. Assim é tudo ou nada.
  await prisma.$transaction([
    prisma.admin.update({ where: { id: token.adminId }, data: { passwordHash } }),
    prisma.passwordResetToken.updateMany({
      where: { adminId: token.adminId, usedAt: null },
      data: { usedAt: new Date() },
    }),
  ]);

  res.json({ ok: true });
});

function sha256(valor: string): string {
  return createHash("sha256").update(valor).digest("hex");
}

/** Corpo HTML do email de recuperação. Só o link e as frases úteis. */
function emailRecuperacao(link: string, validadeHoras: number, contactos: Contactos): string {
  const alvo = escaparHtml(link);
  return `<!doctype html>
<html lang="pt-PT">
<body style="margin:0;padding:24px;background:#faf7f2;font-family:system-ui,-apple-system,'Segoe UI',sans-serif;font-size:16px;line-height:1.5;color:#2b2018">
  <div style="max-width:520px;margin:0 auto;background:#fff;border:1px solid #e8ded0;border-radius:12px;padding:28px">
    ${cabecalhoEmail()}
    <h1 style="margin:0 0 18px;font-size:19px;font-weight:600">Recuperar a tua palavra-passe</h1>
    <p style="margin:0 0 20px">Pediste para escolher uma nova palavra-passe do teu painel da Colo.</p>
    <p style="margin:0 0 24px">
      <a href="${alvo}" style="display:inline-block;background:#2b2018;color:#fff;text-decoration:none;padding:12px 22px;border-radius:8px;font-weight:500">Escolher nova palavra-passe</a>
    </p>
    <p style="margin:0 0 8px;font-size:13px;color:#7a6a5c">O botão não funciona? Copia este endereço para o navegador:</p>
    <p style="margin:0 0 24px;font-size:13px;word-break:break-all"><a href="${alvo}" style="color:#2b2018">${alvo}</a></p>
    <p style="margin:0;font-size:13px;color:#7a6a5c">O link só funciona uma vez e expira em ${validadeHoras} hora. Se não foste tu a pedir isto, não precisas de fazer nada: fica como está.</p>
    ${assinaturaEmail(contactos)}
  </div>
</body>
</html>`;
}

/** A mesma assinatura, em texto simples para quem não vê a parte formatada. */
function assinaturaTexto(contactos: Contactos): string {
  const linhas = [contactos.nome, urlDoSite("")];
  if (contactos.whatsapp) linhas.push(`WhatsApp ${contactos.whatsapp}`);
  return linhas.join("\n");
}

/**
 * Corpo do aviso de mudança de email.
 *
 * Este email é o que desfaz uma dúvida perigosa: se alguém abrir a caixa dela
 * e vir "o teu email mudou" sem nunca ter mudado, a reacção certa é suspectar
 * de intrusão — e é isso mesmo que aconteceu. Por isso o texto diz logo o que
 * fazer nesse caso, em vez de o destinatário ter de deduzir.
 */
function emailAvisoMudanca(email: string, contactos: Contactos): string {
  return `<!doctype html>
<html lang="pt-PT">
<body style="margin:0;padding:24px;background:#faf7f2;font-family:system-ui,-apple-system,'Segoe UI',sans-serif;font-size:16px;line-height:1.5;color:#2b2018">
  <div style="max-width:520px;margin:0 auto;background:#fff;border:1px solid #e8ded0;border-radius:12px;padding:28px">
    ${cabecalhoEmail()}
    <h1 style="margin:0 0 18px;font-size:19px;font-weight:600">O teu email de acesso mudou</h1>
    <p style="margin:0 0 20px">O email de acesso ao teu painel da Colo passou a ser este. A partir de agora entras com:</p>
    <p style="margin:0 0 20px;padding:12px 16px;background:#faf7f2;border:1px solid #e8ded0;border-radius:8px;font-size:15px;word-break:break-all">${escaparHtml(email)}</p>
    <p style="margin:0 0 20px">Se te esqueceres da palavra-passe, o link de recuperação passa também a ir para este endereço.</p>
    <p style="margin:0;padding:14px 16px;background:#fdf3e7;border:1px solid #f0d9b5;border-radius:8px;font-size:14px">
      <strong>Não foste tu a mudar isto?</strong> Muda já a palavra-passe e fala com quem te montou o site.
    </p>
    ${assinaturaEmail(contactos)}
  </div>
</body>
</html>`;
}

/** O link vem do servidor, mas entra num atributo HTML — escapar é obrigatório. */
function escaparHtml(texto: string): string {
  return texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
