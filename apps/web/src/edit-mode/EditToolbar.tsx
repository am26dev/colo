import { useState } from "react";
import { useEditMode } from "./EditModeProvider";
import { getToken } from "../lib/api";
import { toast } from "../components/ui/sonner";

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
      toast("Alterações guardadas.", "ok");
      exitEdit();
    } else {
      toast(r.error ?? "Não foi possível guardar", "erro");
      if (!getToken()) {
        window.location.assign("/gestao/login");
      }
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
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
            Modo edição
          </span>
          <span className="opacity-70">
            {count === 0 ? "Sem alterações" : `${count} ${count === 1 ? "alteração" : "alterações"} por guardar`}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onDiscard}
            className="rounded-md px-3 py-1.5 text-sm font-medium hover:bg-white/10 transition"
          >
            Descartar
          </button>
          <button
            onClick={onSave}
            disabled={!hasPending || saving}
            className="rounded-md bg-[var(--cream-3)] px-4 py-1.5 text-sm font-medium text-[var(--brown-dark)] hover:bg-white transition disabled:opacity-40"
          >
            {saving ? "A guardar..." : "Guardar alterações"}
          </button>
        </div>
      </div>
    </div>
  );
}
