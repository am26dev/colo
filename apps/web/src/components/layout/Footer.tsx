import { site } from "../../data/data";
import type { SiteConfig } from "../../types";
import { EditableText } from "../../edit-mode/EditableText";
import { useEditMode } from "../../edit-mode/EditModeProvider";
import { safeExternalUrl } from "../../utils/format";

const LINKS_UTEIS = [
  { label: "Sobre", href: "#sobre" },
  { label: "Menu", href: "#menu" },
  { label: "Como funciona", href: "#como-funciona" },
  { label: "FAQ", href: "#" },
  { label: "Política de Privacidade", href: "#" },
  { label: "Contactos", href: "#pedido" },
];

export function Footer({ config: _config }: { config: SiteConfig }) {
  const { get } = useEditMode();
  const brandLabel = `${site.nome} — ${site.slogan}`;

  return (
    <footer className="site-footer">
      <div className="container footer-main">
        <p style={{ color: "var(--rose-soft)", margin: "0 0 0.4rem", fontSize: "1.1rem", fontFamily: "var(--serif)", fontStyle: "italic" }}>
          <EditableText contentKey="footer.tagline" />
        </p>
        <p style={{ color: "rgba(246,237,226,.7)", margin: "0 0 2.5rem", fontSize: "0.92rem" }}>
          <EditableText contentKey="footer.agradecimento" />
        </p>

        <div
          className="grid grid-cols-1 md:grid-cols-3"
          style={{ gap: "2.5rem", textAlign: "left", borderTop: "1px solid rgba(246,237,226,.12)", paddingTop: "2.5rem" }}
        >
          <div>
            <img src="/assets/img/logo-footer.webp" alt={brandLabel} className="footer-logo" style={{ marginBottom: "0.9rem" }} />
            <p style={{ color: "rgba(246,237,226,.7)", fontSize: "0.9rem", lineHeight: 1.65, maxWidth: "26em" }}>
              <EditableText contentKey="footer.descricao" multiline />
            </p>
          </div>

          <div>
            <p style={{ fontSize: ".76rem", letterSpacing: ".18em", textTransform: "uppercase", color: "var(--rose-soft)", marginBottom: "1rem" }}>
              <EditableText contentKey="footer.contactos.label" />
            </p>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "0.7rem" }}>
              <li>
                <a href={safeExternalUrl(get("footer.contactos.whatsapp.url"))} target="_blank" rel="noopener" className="link-like" style={{ borderBottom: "0" }}>
                  <EditableText contentKey="footer.contactos.whatsapp.label" />
                </a>
              </li>
              <li>
                <a href={safeExternalUrl(get("footer.contactos.instagram.url"))} target="_blank" rel="noopener" className="link-like" style={{ borderBottom: "0" }}>
                  <EditableText contentKey="footer.contactos.instagram.label" />
                </a>
              </li>
              <li>
                <a href={get("footer.contactos.email.url")} className="link-like" style={{ borderBottom: "0" }}>
                  <EditableText contentKey="footer.contactos.email.label" />
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p style={{ fontSize: ".76rem", letterSpacing: ".18em", textTransform: "uppercase", color: "var(--rose-soft)", marginBottom: "1rem" }}>
              <EditableText contentKey="footer.links.label" />
            </p>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "0.7rem" }}>
              {LINKS_UTEIS.map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="link-like" style={{ borderBottom: "0" }}>
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div
          className="flex flex-col md:flex-row md:items-center md:justify-between"
          style={{ gap: "0.6rem", marginTop: "2.5rem", paddingTop: "1.5rem", borderTop: "1px solid rgba(246,237,226,.12)" }}
        >
          <p className="footer-legal" style={{ margin: 0 }}>
            © <span>{new Date().getFullYear()}</span> {site.nome} – Todos os Direitos Reservados | Desenvolvido
            por:{" "}
            <a href={site.desenvolvidoPor.url} target="_blank" rel="noopener">
              {site.desenvolvidoPor.nome}
            </a>
          </p>
          <p className="footer-legal" style={{ margin: 0 }}>
            <EditableText contentKey="footer.assinatura" />
          </p>
        </div>
      </div>
    </footer>
  );
}
