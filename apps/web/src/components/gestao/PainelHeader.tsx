import type { ReactNode } from "react";
import { Link } from "react-router-dom";

interface Props {
  titulo: string;
  descricao?: ReactNode;
  voltar?: { para: string; label?: string };
  children?: ReactNode;
}

export function PainelHeader({ titulo, descricao, voltar, children }: Props) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0">
        {voltar && (
          <Link
            to={voltar.para}
            className="mb-2 inline-flex items-center gap-1.5 text-xs font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
            {voltar.label ?? "Voltar"}
          </Link>
        )}
        <h1 className="text-2xl font-semibold" style={{ fontFamily: "Georgia, serif" }}>{titulo}</h1>
        {descricao && (
          <p className="mt-1 max-w-2xl text-sm text-[var(--muted-foreground)]">{descricao}</p>
        )}
      </div>
      {children && <div className="flex shrink-0 flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}
