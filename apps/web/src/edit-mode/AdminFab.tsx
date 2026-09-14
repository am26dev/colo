import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEditMode } from "./EditModeProvider";

const base =
  "inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-medium shadow-lg transition-all duration-200 cursor-pointer select-none active:scale-95 hover:shadow-xl hover:-translate-y-0.5";

const idle = { background: "var(--cream-3)", color: "var(--brown)", border: "1px solid rgba(107,63,31,0.15)" };
const hover = { background: "var(--cream-2)", border: "1px solid rgba(107,63,31,0.3)" };

export function AdminFab() {
  const { isAdmin, isEditing, enterEdit } = useEditMode();
  const { logout } = useAuth();
  if (!isAdmin || isEditing) return null;
  return <FabInner enterEdit={enterEdit} logout={logout} />;
}

function FabInner({ enterEdit, logout }: { enterEdit: () => void; logout: () => void }) {
  const [h1, setH1] = useState(false);
  const [h2, setH2] = useState(false);
  const [h3, setH3] = useState(false);
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      <Link
        to="/gestao"
        className={`${base} no-underline`}
        style={h1 ? { ...idle, ...hover } : idle}
        onMouseEnter={() => setH1(true)}
        onMouseLeave={() => setH1(false)}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="9" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="9" x="3" y="12" rx="1"/></svg>
        Gestão
      </Link>
      <button
        type="button"
        onClick={enterEdit}
        className={base}
        style={h2 ? { ...idle, ...hover } : idle}
        onMouseEnter={() => setH2(true)}
        onMouseLeave={() => setH2(false)}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
        Editar site
      </button>
      <button
        type="button"
        onClick={() => { logout(); window.location.href = "/"; }}
        className={base}
        style={h3 ? { ...idle, ...hover } : idle}
        onMouseEnter={() => setH3(true)}
        onMouseLeave={() => setH3(false)}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        Sair
      </button>
    </div>
  );
}
