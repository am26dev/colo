import { useState, type FormEvent } from "react";
import { api } from "../../lib/api";

interface Props {
  onSaved: (msg: string) => void;
  onError: (msg: string) => void;
}

export function ContaCard({ onSaved, onError }: Props) {
  const [atual, setAtual] = useState("");
  const [nova, setNova] = useState("");
  const [nova2, setNova2] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (nova !== nova2) {
      onError("A confirmação não coincide.");
      return;
    }
    setSalvando(true);
    try {
      await api("/api/auth/password", { method: "POST", body: JSON.stringify({ atual, nova }) });
      onSaved("Palavra-passe alterada. ✓");
      setAtual("");
      setNova("");
      setNova2("");
    } catch (err) {
      onError(err instanceof Error ? err.message : "Erro ao alterar palavra-passe.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="card">
      <h2>A minha conta</h2>
      <form onSubmit={handleSubmit}>
        <div className="row">
          <div>
            <label>Palavra-passe atual</label>
            <input type="password" autoComplete="current-password" value={atual} onChange={(e) => setAtual(e.target.value)} />
          </div>
          <div></div>
        </div>
        <div className="row">
          <div>
            <label>Nova palavra-passe</label>
            <input type="password" autoComplete="new-password" value={nova} onChange={(e) => setNova(e.target.value)} />
          </div>
          <div>
            <label>Repetir nova</label>
            <input type="password" autoComplete="new-password" value={nova2} onChange={(e) => setNova2(e.target.value)} />
          </div>
        </div>
        <div className="actions">
          <button className="btn ghost" type="submit" disabled={salvando}>
            Alterar palavra-passe
          </button>
        </div>
      </form>
    </div>
  );
}
