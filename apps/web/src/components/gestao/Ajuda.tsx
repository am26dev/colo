import type { ReactNode } from "react";

interface AjudaProps {
  titulo: string;
  itens?: ReactNode;
  children?: ReactNode;
  variante?: "info" | "aviso";
}

const variantes = {
  info: {
    caixa: "border-[var(--border)] bg-[var(--muted)]/40",
    icone: "text-[var(--primary)]",
    svg: (
      <path d="M12 16v-4M12 8h.01" />
    ),
  },
  aviso: {
    caixa: "border-[var(--destructive)]/40 bg-[var(--destructive)]/10",
    icone: "text-[var(--destructive)]",
    svg: (
      <>
        <path d="M12 9v4M12 17h.01" />
        <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
      </>
    ),
  },
};

/** Caixa de explicação: diz à cliente o que a área faz e o que acontece. */
export function Ajuda({ titulo, itens, children, variante = "info" }: AjudaProps) {
  const v = variantes[variante];
  return (
    <div className={`mb-5 rounded-xl border px-4 py-3 ${v.caixa}`}>
      <p className="flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`shrink-0 ${v.icone}`}
        >
          {v.svg}
        </svg>
        {titulo}
      </p>
      {itens && <ul className="mt-2 space-y-1 pl-6 text-sm text-[var(--muted-foreground)]">{itens}</ul>}
      {children && <div className="mt-2 text-sm text-[var(--muted-foreground)]">{children}</div>}
    </div>
  );
}

/** Texto curto de ajuda por baixo de um campo. */
export function Dica({ children }: { children: ReactNode }) {
  return <p className="mt-1 text-xs text-[var(--muted-foreground)]">{children}</p>;
}
