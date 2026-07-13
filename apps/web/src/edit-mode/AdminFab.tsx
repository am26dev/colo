import { useEditMode } from "./EditModeProvider";

export function AdminFab() {
  const { isAdmin, isEditing, enterEdit } = useEditMode();
  if (!isAdmin || isEditing) return null;
  return (
    <button
      type="button"
      onClick={enterEdit}
      className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 rounded-full bg-[var(--brown)] px-5 py-3 text-sm font-medium text-[var(--cream-3)] shadow-[0_12px_30px_-10px_rgba(78,46,19,0.5)] hover:bg-[var(--brown-dark)] transition"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
      Editar site
    </button>
  );
}
