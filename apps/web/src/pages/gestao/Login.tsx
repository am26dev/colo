import { useEffect, useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import { site } from "../../data/data";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";

export default function Login() {
  const { isAuthenticated, login, setup } = useAuth();
  const navigate = useNavigate();
  const [setupNeeded, setSetupNeeded] = useState<boolean | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api<{ setupNeeded: boolean }>("/api/auth/setup-needed")
      .then((d) => setSetupNeeded(d.setupNeeded))
      .catch(() => setSetupNeeded(false));
  }, []);

  if (isAuthenticated) return <Navigate to="/gestao" replace />;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro("");
    if (setupNeeded && password !== password2) {
      setErro("As palavras-passe não coincidem.");
      return;
    }
    setLoading(true);
    try {
      if (setupNeeded) await setup(email, password);
      else await login(email, password);
      navigate("/gestao");
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao entrar.");
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
              {setupNeeded ? "Bem-vinda! 💛" : "Entrar"}
            </h1>
            {setupNeeded && (
              <p className="text-sm text-[var(--muted-foreground)] text-center mb-4">
                Cria o teu acesso ao painel. Guarda bem estes dados.
              </p>
            )}
            {erro && (
              <div className="rounded-lg bg-[var(--destructive)]/10 border border-[var(--destructive)]/30 px-4 py-2 text-sm text-[var(--destructive)] mb-4">
                {erro}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Palavra-passe</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete={setupNeeded ? "new-password" : "current-password"}
                  placeholder={setupNeeded ? "mínimo 6 caracteres" : undefined}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {setupNeeded && (
                <div className="space-y-2">
                  <Label htmlFor="password2">Repetir palavra-passe</Label>
                  <Input
                    id="password2"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={password2}
                    onChange={(e) => setPassword2(e.target.value)}
                  />
                </div>
              )}
              <Button type="submit" disabled={loading || setupNeeded === null} className="w-full">
                {loading ? "A entrar…" : setupNeeded ? "Criar painel" : "Entrar"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
