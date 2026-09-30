import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { api } from "../../lib/api";
import { site } from "../../data/data";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";

/**
 * Pede o link de recuperação. A API responde sempre a mesma coisa, com ou sem
 * conta com aquele email, por isso esta página não pode prometer nem negar
 * nada: só pode dizer que o link vai a caminho, se é que vai.
 */
export default function RecuperarPage() {
  const [email, setEmail] = useState("");
  const [aviso, setAviso] = useState("");
  const [erro, setErro] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro("");
    setAviso("");
    setLoading(true);
    try {
      const d = await api<{ mensagem: string }>("/api/auth/recuperar", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setAviso(d.mensagem);
      setEnviado(true);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Não foi possível pedir o link. Tenta daqui a pouco.");
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
            <h1 className="text-xl font-semibold text-center mb-1" style={{ fontFamily: "Georgia, serif" }}>
              Recuperar acesso
            </h1>

            {enviado ? (
              <div className="mt-4 space-y-4">
                <p className="rounded-lg border border-[var(--border)] bg-[var(--muted)]/40 px-4 py-3 text-sm text-[var(--muted-foreground)]">
                  {aviso}
                </p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  Não chegou? Confirma primeiro a pasta de spam — o link expira ao fim de uma hora. Se não
                  chegar de todo, fala com quem te montou o site.
                </p>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/gestao/login">Voltar a entrar</Link>
                </Button>
              </div>
            ) : (
              <>
                <p className="text-sm text-[var(--muted-foreground)] text-center mb-4">
                  Escreve o email com que entraste. Enviamos um link para escolher uma palavra-passe nova.
                </p>
                {erro && (
                  <div className="rounded-lg bg-[var(--destructive)]/10 border border-[var(--destructive)]/30 px-4 py-2 text-sm text-[var(--destructive)] mb-4">
                    {erro}
                  </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      autoComplete="username"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? "A enviar…" : "Enviar link"}
                  </Button>
                </form>
                <p className="mt-4 text-center text-xs">
                  <Link to="/gestao/login" className="underline">
                    Voltar a entrar
                  </Link>
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
