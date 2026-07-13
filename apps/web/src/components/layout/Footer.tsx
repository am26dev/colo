import { useState } from "react";
import { footerStrip, site } from "../../data/data";
import type { SiteConfig } from "../../types";
import { EditableText } from "../../edit-mode/EditableText";
import { safeExternalUrl } from "../../utils/format";
import { whatsappLink } from "../../utils/whatsapp";

export function Footer({ config }: { config: SiteConfig }) {
  const [copied, setCopied] = useState(false);
  const brandLabel = `${site.nome} — ${site.slogan}`;

  async function handleCopy() {
    const url = window.location.href;
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else if (navigator.share) {
      navigator.share({ title: brandLabel, url });
    }
  }

  return (
    <footer className="site-footer">
      <div className="footer-strip">
        <div className="container footer-strip-inner">
          {footerStrip.map((palavra) => (
            <span key={palavra}>{palavra}</span>
          ))}
        </div>
      </div>
      <div className="container footer-main">
        <div className="footer-brand">
          <img src="/assets/img/logo-footer.webp" alt={brandLabel} className="footer-logo" />
        </div>
        <p style={{ color: "var(--rose-soft)", margin: "0.5rem 0 1.5rem", fontSize: "1.05rem" }}>
          <EditableText contentKey="footer.tagline" />
        </p>
        <div className="footer-links">
          <a href={safeExternalUrl(config.instagram)} target="_blank" rel="noopener">
            Instagram
          </a>
          <a href={whatsappLink(config.whatsapp)} target="_blank" rel="noopener">
            WhatsApp
          </a>
          <button type="button" className="link-like" onClick={handleCopy}>
            {copied ? "Link copiado! ✓" : "Copiar link do site"}
          </button>
        </div>
        <p className="footer-legal">
          © <span>{new Date().getFullYear()}</span> {site.nome} – Todos os Direitos Reservados | Desenvolvido
          por:{" "}
          <a href={site.desenvolvidoPor.url} target="_blank" rel="noopener">
            {site.desenvolvidoPor.nome}
          </a>
        </p>
      </div>
    </footer>
  );
}
