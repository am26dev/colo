import { useState } from "react";
import { useEditMode } from "./EditModeProvider";

export function EditToolbar() {
  const { isEditing, isAdmin, hasPending, pending, save, exitEdit } = useEditMode();
  const [saving, setSaving] = useState(false);
  if (!isEditing || !isAdmin) return null;

  const count = Object.keys(pending).length;

  const onSave = async () => {
    setSaving(true);
    const r = await save();
    setSaving(false);
    if (r.ok) {
      const el = document.querySelector('[data-sonner-toaster]');
      if (el) {
        const event = new CustomEvent('sonner-toast', { detail: { message: "Alterações guardadas." } });
        window.dispatchEvent(event);
      }
      alert("Alterações guardadas.");
    } else {
      alert(`Erro: ${r.error ?? "Não foi possível guardar"}`);
    }
  };

  const onDiscard = () => {
    exitEdit();
    window.location.reload();
  };

  return (
    <div className="fixed top-0 inset-x-0 z-[100] bg-[var(--brown-dark)] text-[var(--cream-3)] shadow-lg">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-2 font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
            Modo edição
          </span>
          <span className="opacity-70">
            {count === 0 ? "Sem alterações" : `${count} ${count === 1 ? "alteração" : "alterações"} por guardar`}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onDiscard}
            className="inline-flex items-center gap-2 rounded-full border border-white/30 px-4 py-1.5 text-white hover:bg-white/10"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            Descartar
          </button>
          <button
            onClick={onSave}
            disabled={!hasPending || saving}
            className="inline-flex items-center gap-2 rounded-full bg-[var(--rose)] px-4 py-1.5 font-medium text-[var(--brown-dark)] hover:bg-[var(--rose-deep)] hover:text-[var(--cream-3)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M17 21v-7a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v7"/><path d="M7 3v4a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V3"/></svg>
            {saving ? "A guardar..." : "Guardar alterações"}
          </button>
        </div>
      </div>
    </div>
  );
}
