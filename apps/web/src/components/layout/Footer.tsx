import type { SiteConfig } from "../../types";
import { EditableText } from "../../edit-mode/EditableText";
import { useEditMode } from "../../edit-mode/EditModeProvider";
import { safeExternalUrl } from "../../utils/format";
import { whatsappLink } from "../../utils/whatsapp";

export function Footer({ config }: { config: SiteConfig }) {
  const { get } = useEditMode();

  return (
    <footer
      style={{ background: "var(--cream-2)", color: "var(--brown-dark)" }}
    >
      <div className="container" style={{ padding: "4rem 28px" }}>
        <div className="text-center">
          <p
            style={{
              fontFamily: "var(--serif)",
              fontSize: "2.0rem",
              fontStyle: "italic",
              color: "var(--brown)",
            }}
            className="md:text-3xl"
          >
            <EditableText contentKey="footer.tagline" />
          </p>
          <p
            style={{
              marginTop: "0.75rem",
              fontSize: "0.9375rem",
              color: "var(--muted)",
            }}
          >
            <EditableText contentKey="footer.agradecimento" />
          </p>
        </div>

        <div
          style={{
            margin: "3rem 0",
            height: "1px",
            background: "rgba(107, 63, 31, 0.15)",
          }}
        />

        <div
          style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2.5rem" }}
          className="md:grid-cols-4"
        >
          <div className="md:col-span-2">
            <div>
              <img
                src="/assets/img/logo-header.webp"
                alt={get("footer.brand")}
                style={{ width: "135px", height: "auto" }}
              />
            </div>
            <p
              style={{
                marginTop: "0.75rem",
                maxWidth: "24rem",
                fontSize: "0.9375rem",
                color: "var(--muted)",
              }}
            >
              <EditableText contentKey="footer.descricao" multiline />
            </p>
          </div>

          <div>
            <div
              style={{
                fontSize: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.2em",
                color: "var(--muted)",
              }}
            >
              <EditableText contentKey="footer.contactos.label" />
            </div>
            <ul
              style={{
                marginTop: "1rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
                listStyle: "none",
                padding: 0,
                fontSize: "0.9375rem",
              }}
            >
              <li>
                <a
                  href={
                    get("footer.contactos.whatsapp.url") ||
                    whatsappLink(config.whatsapp)
                  }
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    color: "inherit",
                    textDecoration: "none",
                  }}
                  className="hover:text-[var(--rose-deep)]"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
                    <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" />
                  </svg>
                  <EditableText contentKey="footer.contactos.whatsapp.label" />
                </a>
              </li>
              <li>
                <a
                  href={
                    get("footer.contactos.instagram.url") ||
                    safeExternalUrl(config.instagram)
                  }
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    color: "inherit",
                    textDecoration: "none",
                  }}
                  className="hover:text-[var(--rose-deep)]"
                  target="_blank"
                  rel="noopener"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                  <EditableText contentKey="footer.contactos.instagram.label" />
                </a>
              </li>
              <li>
                <a
                  href={
                    get("footer.contactos.email.url") || "mailto:ola@colo.ao"
                  }
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    color: "inherit",
                    textDecoration: "none",
                  }}
                  className="hover:text-[var(--rose-deep)]"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                  <EditableText contentKey="footer.contactos.email.label" />
                </a>
              </li>
            </ul>
          </div>

          <div>
            <div
              style={{
                fontSize: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.2em",
                color: "var(--muted)",
              }}
            >
              <EditableText contentKey="footer.links.label" />
            </div>
            <ul
              style={{
                marginTop: "1rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
                listStyle: "none",
                padding: 0,
                fontSize: "0.9375rem",
              }}
            >
              <li>
                <a
                  href="#sobre"
                  style={{ color: "inherit", textDecoration: "none" }}
                  className="hover:text-[var(--rose-deep)]"
                >
                  Sobre a Colo
                </a>
              </li>
              <li>
                <a
                  href="#menu"
                  style={{ color: "inherit", textDecoration: "none" }}
                  className="hover:text-[var(--rose-deep)]"
                >
                  Menu da semana
                </a>
              </li>
              <li>
                <a
                  href="#como-funciona"
                  style={{ color: "inherit", textDecoration: "none" }}
                  className="hover:text-[var(--rose-deep)]"
                >
                  Como funciona
                </a>
              </li>
              <li>
                <a
                  href="#pedido"
                  style={{ color: "inherit", textDecoration: "none" }}
                  className="hover:text-[var(--rose-deep)]"
                >
                  FAQ
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div
          style={{
            marginTop: "3rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "0.5rem",
            borderTop: "1px solid rgba(107, 63, 31, 0.15)",
            paddingTop: "1.5rem",
            fontSize: "0.8125rem",
            color: "var(--muted)",
          }}
          className="md:flex-row"
        >
          <div>
            © {new Date().getFullYear()}{" "}
            <EditableText contentKey="footer.copyright" />
          </div>
          <div>
            <EditableText contentKey="footer.assinatura" />
          </div>
        </div>
      </div>
    </footer>
  );
}
