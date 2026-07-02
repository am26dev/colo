import { useEffect, useRef, useState } from "react";
import { nav, site } from "../../data/data";

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
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={item.cta ? "nav-cta" : undefined}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </a>
          ))}
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
