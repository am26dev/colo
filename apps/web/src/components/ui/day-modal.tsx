import { useEffect, useRef, type ReactNode } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

export function DayModal({ open, onClose, children }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => { if (e.target === ref.current) onClose(); }}
      className="backdrop:bg-black/40 bg-transparent p-0 m-auto max-w-lg w-[92vw] rounded-2xl shadow-2xl open:animate-in open:fade-in open:zoom-in-95 open:duration-200"
    >
      {children}
    </dialog>
  );
}
