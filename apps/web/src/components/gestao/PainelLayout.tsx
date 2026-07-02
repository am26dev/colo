import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { site } from "../../data/data";

const links = [
  { to: "/gestao", label: "Dashboard", end: true },
  { to: "/gestao/pedidos", label: "Pedidos", end: false },
  { to: "/gestao/semanas", label: "Semanas", end: false },
  { to: "/gestao/informacoes", label: "Informações", end: false },
  { to: "/gestao/conta", label: "Conta", end: false },
];

export function PainelLayout() {
  const { logout } = useAuth();

  return (
    <div className="painel">
      <div className="painel-shell">
        <aside className="painel-sidebar">
          <div className="logo">
            <img src="/assets/img/logo-header.webp" alt={site.nome} className="logo-img" />
            <small>Painel de gestão</small>
          </div>
          <nav className="painel-nav">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => (isActive ? "activo" : undefined)}>
                {l.label}
              </NavLink>
            ))}
          </nav>
          <div className="painel-sidebar-footer">
            <a className="btn ghost sm" href="/" target="_blank" rel="noopener">
              Ver site ↗
            </a>
            <button className="btn ghost sm" type="button" onClick={logout}>
              Sair
            </button>
          </div>
        </aside>
        <main className="painel-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
