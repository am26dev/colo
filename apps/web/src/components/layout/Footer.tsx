import type { SiteConfig } from "../../types";
import { EditableText } from "../../edit-mode/EditableText";
import { useEditMode } from "../../edit-mode/EditModeProvider";
import { itemsVisiveis, RODAPE_GRUPOS, type RodapeItem } from "../../data/rodape";

const ICONES: Record<string, React.ReactNode> = {
  whatsapp: (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
      <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" />
    </svg>
  ),
  instagram: (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  ),
  email: (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  ),
};

function RodapeColuna({ item, config }: { item: RodapeItem; config: SiteConfig }) {
  const { get } = useEditMode();
  const href =
    item.href ||
    (item.contentKeyUrl ? get(item.contentKeyUrl) : "") ||
    item.urlPadrao?.(config) ||
    "#";

  return (
    <li>
      <a
        href={href}
        style={{
          display: item.icone ? "inline-flex" : undefined,
          alignItems: item.icone ? "center" : undefined,
          gap: item.icone ? "0.5rem" : undefined,
          color: "inherit",
          textDecoration: "none",
        }}
        className="hover:text-[var(--rose-deep)]"
        target={item.icone === "whatsapp" || item.icone === "email" ? undefined : item.icone ? "_blank" : undefined}
        rel={item.icone === "instagram" ? "noopener" : undefined}
      >
        {item.icone ? ICONES[item.icone] : null}
        {item.contentKeyLabel ? (
          <EditableText contentKey={item.contentKeyLabel} />
        ) : (
          item.rotulo
        )}
      </a>
    </li>
  );
}

export function Footer({ config }: { config: SiteConfig }) {
  const { get, isAdmin } = useEditMode();
  const grupos = RODAPE_GRUPOS.map((g) => ({ ...g, items: itemsVisiveis(get, g.id) })).filter(
    (g) => g.items.length > 0,
  );

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

          {grupos.map((grupo) => (
            <div key={grupo.id}>
              <div
                style={{
                  fontSize: "0.75rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.2em",
                  color: "var(--muted)",
                }}
              >
                <EditableText contentKey={grupo.contentKeyLabel} />
              </div>
              <ul
                style={{
                  marginTop: "1rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: grupo.id === "contactos" ? "0.75rem" : "0.5rem",
                  listStyle: "none",
                  padding: 0,
                  fontSize: "0.9375rem",
                }}
              >
                {grupo.items.map((item) => (
                  <RodapeColuna key={item.id} item={item} config={config} />
                ))}
              </ul>
            </div>
          ))}
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
          {!isAdmin && (
            <div>
              <a
                href="/gestao/login"
                style={{ color: "inherit", textDecoration: "none", opacity: 0.3, fontSize: "0.7rem" }}
                className="hover:opacity-60 transition-opacity"
              >
                Gestão
              </a>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
