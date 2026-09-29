import type { SiteConfig } from "../types";
import { safeExternalUrl } from "../utils/format";
import { whatsappLink } from "../utils/whatsapp";

export type RodapeGrupo = "contactos" | "links";

export interface RodapeItem {
  /** Identificador estável. É também a chave de visibilidade (`footer.visivel.<id>`). */
  id: string;
  grupo: RodapeGrupo;
  rotulo: string;
  /** Ligação para os links internos do site. */
  href?: string;
  icone?: "whatsapp" | "instagram" | "email";
  /** Chave de texto dos contactos, editável no local. */
  contentKeyLabel?: string;
  /** Chave de link dos contactos, editável no local. */
  contentKeyUrl?: string;
  /** Link usado quando a chave editável está vazia. */
  urlPadrao?: (config: SiteConfig) => string;
}

export const RODAPE_ITEMS: RodapeItem[] = [
  {
    id: "contatos.whatsapp",
    grupo: "contactos",
    rotulo: "WhatsApp",
    icone: "whatsapp",
    contentKeyLabel: "footer.contactos.whatsapp.label",
    contentKeyUrl: "footer.contactos.whatsapp.url",
    urlPadrao: (config) => whatsappLink(config.whatsapp),
  },
  {
    id: "contatos.instagram",
    grupo: "contactos",
    rotulo: "Instagram",
    icone: "instagram",
    contentKeyLabel: "footer.contactos.instagram.label",
    contentKeyUrl: "footer.contactos.instagram.url",
    urlPadrao: (config) => safeExternalUrl(config.instagram),
  },
  {
    id: "contatos.email",
    grupo: "contactos",
    rotulo: "Email",
    icone: "email",
    contentKeyLabel: "footer.contactos.email.label",
    contentKeyUrl: "footer.contactos.email.url",
    urlPadrao: () => "mailto:ola@colo.ao",
  },
  { id: "links.sobre", grupo: "links", rotulo: "Sobre a Colo", href: "#sobre" },
  { id: "links.menu", grupo: "links", rotulo: "Menu da semana", href: "#menu" },
  { id: "links.como", grupo: "links", rotulo: "Como funciona", href: "#como-funciona" },
  { id: "links.faq", grupo: "links", rotulo: "FAQ", href: "#pedido" },
];

export const RODAPE_GRUPOS: { id: RodapeGrupo; titulo: string; contentKeyLabel: string }[] = [
  { id: "contactos", titulo: "Contactos", contentKeyLabel: "footer.contactos.label" },
  { id: "links", titulo: "Links úteis", contentKeyLabel: "footer.links.label" },
];

export function chaveVisibilidade(id: string): string {
  return `footer.visivel.${id}`;
}

/** Tudo visível por omissão: só fica escondido depois de a cliente desligar. */
export function itemVisivel(get: (key: string) => string, item: RodapeItem): boolean {
  return get(chaveVisibilidade(item.id)) !== "false";
}

export function itemsVisiveis(
  get: (key: string) => string,
  grupo: RodapeGrupo,
): RodapeItem[] {
  return RODAPE_ITEMS.filter((i) => i.grupo === grupo && itemVisivel(get, i));
}
