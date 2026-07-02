import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { site } from "../../data/data";
import { Sheet } from "../ui/sheet";

const links = [
  { to: "/gestao", label: "Dashboard", end: true },
  { to: "/gestao/pedidos", label: "Pedidos", end: false },
  { to: "/gestao/semanas", label: "Semanas", end: false },
  { to: "/gestao/informacoes", label: "Informações", end: false },
  { to: "/gestao/conta", label: "Conta", end: false },
];

function NavContent({ onClick }: { onClick?: () => void }) {
  const { logout } = useAuth();
  return (
    <>
      <div className="p-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-3">
          <img src="/assets/img/logo-header.webp" alt={site.nome} className="h-10 w-auto" />
        </div>
        <p className="text-[11px] uppercase tracking-widest text-[var(--muted-foreground)] mt-1">
          Painel de gestão
        </p>
      </div>
      <nav className="flex flex-col gap-1 p-2">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            onClick={onClick}
            className={({ isActive }) =>
              `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                  : "text-[var(--foreground)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]"
              }`
            }
          >
            {l.label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto p-4 border-t border-[var(--border)] flex flex-col gap-2">
        <a
          className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] transition-colors"
          href="/"
          target="_blank"
          rel="noopener"
        >
          Ver site ↗
        </a>
        <button
          className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] transition-colors text-left"
          type="button"
          onClick={() => { logout(); onClick?.(); }}
        >
          Sair
        </button>
      </div>
    </>
  );
}

export function PainelLayout() {
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <div className="painel min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* Mobile header */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-[var(--border)] bg-[var(--card)]">
        <button
          type="button"
          className="rounded-md p-2 hover:bg-[var(--accent)] transition-colors"
          onClick={() => setSheetOpen(true)}
          aria-label="Abrir menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
        <img src="/assets/img/logo-header.webp" alt={site.nome} className="h-8 w-auto" />
        <div className="w-10" />
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <div className="flex flex-col h-full">
          <NavContent onClick={() => setSheetOpen(false)} />
        </div>
      </Sheet>

      <div className="flex max-w-[1180px] mx-auto">
        {/* Desktop sidebar */}
        <aside className="hidden lg:flex flex-col w-[220px] min-h-screen border-r border-[var(--border)] p-4 shrink-0">
          <NavContent />
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6 lg:p-8 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
