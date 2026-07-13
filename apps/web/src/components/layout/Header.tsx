import { useEffect, useRef, useState } from "react";
import { site } from "../../data/data";
import { EditableText } from "../../edit-mode/EditableText";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", onClickOutside);
    return () => document.removeEventListener("click", onClickOutside);
  }, [open]);

  const brandLabel = `${site.nome} — ${site.slogan}`;

  return (
    <header
      ref={headerRef}
      id="topo"
      className={`site-header${scrolled ? " scrolled" : ""}${open ? " open" : ""}`}
    >
      <div className="container header-inner">
        <a href="#topo" className="brand" aria-label={brandLabel}>
          <img src="/assets/img/logo-header.webp" alt={brandLabel} className="brand-logo" />
        </a>

        <nav className="nav" aria-label="Navegação principal">
          <a href="#sobre" onClick={() => setOpen(false)}>
            <EditableText contentKey="header.nav.sobre" />
          </a>
          <a href="#menu" onClick={() => setOpen(false)}>
            <EditableText contentKey="header.nav.menu" />
          </a>
          <a href="#como-funciona" onClick={() => setOpen(false)}>
            <EditableText contentKey="header.nav.como" />
          </a>
          <a href="#pedido" className="nav-cta" onClick={() => setOpen(false)}>
            <EditableText contentKey="header.nav.pedido" />
          </a>
        </nav>

        <button
          type="button"
          className="nav-toggle"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </header>
  );
}
