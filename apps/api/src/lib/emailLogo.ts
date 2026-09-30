/**
 * O logotipo do Colo para os emails.
 *
 * Vai embutido no corpo (`cid:`) e não como `https://colo.ao/assets/…`. A
 * diferença não é cosmética: Gmail, Outlook e Apple Mail bloqueiam imagens
 * remotas por omissão e mostram um aviso de "mostrar imagens" por cima do
 * conteúdo. Num email de recuperação de senha, o destinatário já desconfia por
 * definição — se o lugar onde devia estar o nome do Colo aparece como um
 * quadrado cinzento, a primeira conclusão é que é uma burla. A imagem embutida
 * mostra-se sem clique nenhum.
 *
 * O ficheiro é lido de um caminho configurável, e não de dentro do pacote: o
 * logotipo é uma coisa que a dona pode querer trocar sem se pedir um deploy.
 */
import { existsSync, readFileSync } from "node:fs";
import { APP_URL } from "./appUrl.js";

interface Logo {
  cid: string;
  nomeFicheiro: string;
  conteudo: Buffer;
  largura: number;
}

let emCache: Logo | null = null;

/** Caminho por omissão, relativo à raiz do repo, onde vive o ficheiro do site. */
const CAMINHO_PADRAO = "/app/assets/img/logo-email.png";

/**
 * Busca o logotipo e devolve-o, ou `null` se não estiver lá.
 *
 * `null` não é um erro a ser resolvido: o email sai sem logo. Um email sem imagem é
 * aceitável; um email que não sai porque falta um ficheiro de imagem não é.
 */
export function logotipoDoColo(): Logo | null {
  if (emCache) return emCache;

  const caminho = process.env.EMAIL_LOGO_PATH ?? CAMINHO_PADRAO;
  if (!existsSync(caminho)) {
    console.error(`[email] logotipo não encontrado em ${caminho}; o email sai sem logo`);
    return null;
  }

  const extensao = caminho.split(".").pop()?.toLowerCase() ?? "png";
  emCache = {
    cid: "logo-colo",
    nomeFicheiro: `logo-colo.${extensao}`,
    conteudo: readFileSync(caminho),
    // A largura segue a altura que a maioria dos clientes impõe a uma imagem de
    // cabeçalho; sem `width`, o Outlook desenha-a no tamanho natural (1000+ px)
    // e empurra o texto para fora do ecrã.
    largura: 132,
  };
  return emCache;
}

/**
 * Bloco de cabeçalho com o logotipo, ou a versão em texto quando não há imagem.
 *
 * A versão em texto não é um plano B decorativo: um cliente que bloqueia
 * imagens por configuração (não por omissão) não mostra o embutido, e ficar sem
 * identificação nenhuma. O nome escrito abaixo do logo resolve os dois casos.
 */
export function cabecalhoEmail(): string {
  const logo = logotipoDoColo();
  if (!logo) {
    return `<p style="margin:0 0 20px;font-size:18px;font-weight:600;letter-spacing:0.08em">COLO</p>`;
  }
  // O `alt` não é decoração: quem não vê imagens lê "Colo" em texto no sítio
  // onde o logo estava. É a mesma informação, só que por outro sentido.
  const imagem = `<img src="cid:${logo.cid}" alt="Colo" width="${logo.largura}" style="display:block;width:${logo.largura}px;height:auto;border:0" />`;
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;border-collapse:collapse">
      <tr>
        <td style="padding:0">
          <a href="${escaparHtml(APP_URL)}" style="text-decoration:none;display:block">${imagem}</td>
      </tr>
    </table>`;
}

/** A peça que falta ao email: o próprio ficheiro da imagem. */
export function anexosDoEmail(): { cid: string; nomeFicheiro: string; conteudo: Buffer }[] | undefined {
  const logo = logotipoDoColo();
  if (!logo) return undefined;
  return [{ cid: logo.cid, nomeFicheiro: logo.nomeFicheiro, conteudo: logo.conteudo }];
}

function escaparHtml(texto: string): string {
  return texto.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
