import { Button } from "../ui/button";

interface Props {
  mensagem?: string;
  titulo?: string;
  aoTentar?: () => void;
  aCarregar?: boolean;
}

/** Estado de erro visível: evita que a página fique eternamente a carregar. */
export function EstadoErro({ mensagem, titulo = "Não foi possível carregar esta área", aoTentar, aCarregar }: Props) {
  return (
    <div className="mb-5 rounded-xl border border-[var(--destructive)]/40 bg-[var(--destructive)]/10 px-4 py-3">
      <p className="flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--destructive)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4M12 16h.01" />
        </svg>
        {titulo}
      </p>
      <p className="mt-1 pl-[23px] text-sm text-[var(--muted-foreground)]">
        {mensagem ?? "Verifica a ligação e tenta de novo. Nada foi alterado no site."}
      </p>
      {aoTentar && (
        <div className="mt-3 pl-[23px]">
          <Button type="button" variant="outline" size="sm" onClick={aoTentar} disabled={aCarregar}>
            {aCarregar ? "A tentar..." : "Tentar de novo"}
          </Button>
        </div>
      )}
    </div>
  );
}
