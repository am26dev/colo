import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
      <p className="text-7xl font-bold text-[var(--primary)]" style={{ fontFamily: "Georgia, serif" }}>404</p>
      <h1 className="mt-4 text-xl font-semibold" style={{ fontFamily: "Georgia, serif" }}>
        Página não encontrada
      </h1>
      <p className="mt-2 text-sm text-[var(--muted-foreground)] max-w-md">
        O link que seguiste não existe ou foi removido. Verifica o endereço ou volta ao início.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex items-center rounded-lg bg-[var(--primary)] px-5 py-2.5 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90 transition-opacity"
      >
        Voltar ao início
      </Link>
    </div>
  );
}
