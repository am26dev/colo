/**
 * URL pública do site, para os links que vão para fora (hoje, o link de
 * recuperação de palavra-passe).
 *
 * `PANO_URL` é a fonte de verdade; sem ela, cai no primeiro domínio de
 * `CORS_ORIGIN`, que em produção já é o correcto. A barra final tira-se para
 * não construir `https://colo.ao//gestao`.
 */
function primeiroDominio(): string {
  const bruto = (process.env.PANO_URL ?? process.env.CORS_ORIGIN ?? "").split(",")[0]?.trim();
  return bruto.replace(/\/+$/, "");
}

export const APP_URL = primeiroDominio();

/** URL absoluta a partir de um caminho do site, ex.: `novaSenhaUrl(token)`. */
export function urlDoSite(caminho: string): string {
  return `${APP_URL}${caminho.startsWith("/") ? caminho : `/${caminho}`}`;
}
