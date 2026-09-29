import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { site } from "../../data/data";
import { Sheet } from "../ui/sheet";
import { useEditMode } from "../../edit-mode/EditModeProvider";

const links = [
  { to: "/gestao", label: "Dashboard", ajuda: "Resumo da semana e dos pedidos", end: true },
  { to: "/gestao/pedidos", label: "Pedidos", ajuda: "Reservas que precisam de resposta", end: false },
  { to: "/gestao/semanas", label: "Semanas", ajuda: "Criar e activar o menu da semana", end: false },
  { to: "/gestao/informacoes", label: "Informações", ajuda: "Contactos, pagamento e rodapé", end: false },
  { to: "/gestao/conta", label: "Conta", ajuda: "Palavra-passe do painel", end: false },
];

function NavContent({ onClick }: { onClick?: () => void }) {
  const { enterEdit } = useEditMode();
  const navegar = useNavigate();

  return (
    <>
      <div className="border-b border-[var(--border)] p-4">
        <div className="flex items-center gap-3">
          <img src="/assets/img/logo-header.webp" alt={site.nome} className="h-10 w-auto" />
        </div>
        <p className="mt-1 text-[11px] uppercase tracking-widest text-[var(--muted-foreground)]">
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
            <span className="mt-0.5 block text-[11px] font-normal leading-snug text-[var(--muted-foreground)]">
              {l.ajuda}
            </span>
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto flex flex-col gap-2 border-t border-[var(--border)] p-4">
        <button
          type="button"
          className="rounded-lg px-3 py-2 text-left text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]"
          onClick={() => {
            enterEdit();
            navegar("/");
            onClick?.();
          }}
        >
          Editar os textos do site
          <span className="mt-0.5 block text-[11px] font-normal leading-snug text-[var(--muted-foreground)]">
            Abre o site para mexer nos títulos e frases
          </span>
        </button>
        <a
          className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]"
          href="/"
          target="_blank"
          rel="noopener"
        >
          Ver o site como uma visita ↗
        </a>
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

      <div className="mx-auto flex max-w-[1180px]">
        {/* Desktop sidebar */}
        <aside className="sticky top-0 hidden h-screen w-[220px] shrink-0 flex-col overflow-y-auto border-r border-[var(--border)] p-4 lg:flex">
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
