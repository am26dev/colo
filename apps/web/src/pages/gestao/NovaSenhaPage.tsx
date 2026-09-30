import { useEffect, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../../lib/api";
import { site } from "../../data/data";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";

type Estado = "a-validar" | "link-invalido" | "a-mostrar" | "guardado";

/**
 * Define a palavra-passe a partir do link do email.
 *
 * O link traz o token no `?token=`. Antes de mostrar os campos validamo-lo no
 * servidor: assim a dona vê logo "este link já não dá" em vez de preencher o
 * formulário para descobrir no fim que não vale nada.
 */
export default function NovaSenhaPage() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const [estado, setEstado] = useState<Estado>("a-validar");
  const [erro, setErro] = useState("");
  const [nova, setNova] = useState("");
  const [nova2, setNova2] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setEstado("link-invalido");
      return;
    }
    api<{ ok: boolean }>(`/api/auth/recuperar/validar?token=${encodeURIComponent(token)}`)
      .then(() => setEstado("a-mostrar"))
      .catch((e) => {
        setErro(e instanceof Error ? e.message : "Este link já não é válido.");
        setEstado("link-invalido");
      });
  }, [token]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro("");
    if (nova !== nova2) {
      setErro("As palavras-passe não coincidem.");
      return;
    }
    setLoading(true);
    try {
      await api("/api/auth/recuperar/definir", {
        method: "POST",
        body: JSON.stringify({ token, nova }),
      });
      setEstado("guardado");
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Não foi possível mudar a palavra-passe.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="painel min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="min-h-screen grid place-items-center p-6">
        <Card className="w-full max-w-sm">
          <CardContent className="pt-6">
            <div className="text-center mb-6">
              <img src="/assets/img/logo-header.webp" alt={site.nome} className="h-12 w-auto mx-auto mb-1" />
              <p className="text-[11px] uppercase tracking-widest text-[var(--muted-foreground)]">Painel de gestão</p>
            </div>

            {estado === "a-validar" && (
              <p className="text-sm text-center text-[var(--muted-foreground)]">A ver se o link ainda é válido…</p>
            )}

            {estado === "link-invalido" && (
              <div className="space-y-4">
                <h1 className="text-xl font-semibold text-center mb-1" style={{ fontFamily: "Georgia, serif" }}>
                  Este link não dá
                </h1>
                <p className="rounded-lg bg-[var(--destructive)]/10 border border-[var(--destructive)]/30 px-4 py-2 text-sm text-[var(--destructive)]">
                  {erro || "O link já foi usado ou expirou."}
                </p>
                <Button asChild className="w-full">
                  <Link to="/gestao/recuperar">Pedir um link novo</Link>
                </Button>
              </div>
            )}

            {estado === "guardado" && (
              <div className="space-y-4">
                <h1 className="text-xl font-semibold text-center mb-1" style={{ fontFamily: "Georgia, serif" }}>
                  Palavra-passe mudada
                </h1>
                <p className="rounded-lg border border-[var(--border)] bg-[var(--muted)]/40 px-4 py-3 text-sm text-[var(--muted-foreground)]">
                  Já podes entrar com a nova. Por segurança, o link só servia uma vez.
                </p>
                <Button asChild className="w-full">
                  <Link to="/gestao/login">Entrar</Link>
                </Button>
              </div>
            )}

            {estado === "a-mostrar" && (
              <>
                <h1 className="text-xl font-semibold text-center mb-1" style={{ fontFamily: "Georgia, serif" }}>
                  Escolhe a nova senha
                </h1>
                <p className="text-sm text-[var(--muted-foreground)] text-center mb-4">
                  Mínimo 6 caracteres. Escolhe uma que não uses noutro sítio.
                </p>
                {erro && (
                  <div className="rounded-lg bg-[var(--destructive)]/10 border border-[var(--destructive)]/30 px-4 py-2 text-sm text-[var(--destructive)] mb-4">
                    {erro}
                  </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nova">Palavra-passe nova</Label>
                    <Input
                      id="nova"
                      type="password"
                      autoComplete="new-password"
                      required
                      minLength={6}
                      value={nova}
                      onChange={(e) => setNova(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nova2">Repetir palavra-passe</Label>
                    <Input
                      id="nova2"
                      type="password"
                      autoComplete="new-password"
                      required
                      minLength={6}
                      value={nova2}
                      onChange={(e) => setNova2(e.target.value)}
                    />
                  </div>
                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? "A guardar…" : "Guardar"}
                  </Button>
                </form>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
