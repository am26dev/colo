import { cn } from "../../lib/utils";
import { useEffect, type HTMLAttributes, type ReactNode } from "react";

interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}

function Sheet({ open, onOpenChange, children }: SheetProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
        onClick={() => onOpenChange(false)}
      />
      <div className="fixed inset-y-0 left-0 z-50 w-3/4 max-w-xs border-r border-[var(--border)] bg-[var(--card)] shadow-lg">
        {children}
      </div>
    </>
  );
}

interface SheetCloseProps extends HTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
}

function SheetClose({ className, children, onClick, ...props }: SheetCloseProps) {
  return (
    <button
      className={cn("text-sm font-medium hover:opacity-70", className)}
      onClick={onClick}
      {...props}
    >
      {children ?? "Fechar"}
    </button>
  );
}

export { Sheet, SheetClose };
