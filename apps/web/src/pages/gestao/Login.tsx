import { useEffect, useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import { site } from "../../data/data";

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
    <div className="painel">
      <div className="center">
        <div className="card login-card">
          <div className="logo">
            <img  src="/assets/img/logo-header.webp" alt={site.nome} className="logo-img" />
            <small>Painel de gestão</small>
          </div>
          <h1>{setupNeeded ? "Bem-vinda! 💛" : "Entrar"}</h1>
          {setupNeeded && <p className="sub">Cria o teu acesso ao painel. Guarda bem estes dados.</p>}
          {erro && <div className="flash erro">{erro}</div>}
          <form onSubmit={handleSubmit}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <label htmlFor="password">Palavra-passe</label>
            <input
              id="password"
              type="password"
              autoComplete={setupNeeded ? "new-password" : "current-password"}
              placeholder={setupNeeded ? "mínimo 6 caracteres" : undefined}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {setupNeeded && (
              <>
                <label htmlFor="password2">Repetir palavra-passe</label>
                <input
                  id="password2"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password2}
                  onChange={(e) => setPassword2(e.target.value)}
                />
              </>
            )}
            <div className="actions">
              <button className="btn" type="submit" disabled={loading || setupNeeded === null}>
                {loading ? "A entrar…" : setupNeeded ? "Criar painel" : "Entrar"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
