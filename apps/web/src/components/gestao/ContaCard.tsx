import { useState, type FormEvent } from "react";
import { api } from "../../lib/api";
import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Dica } from "./Ajuda";
import { EstadoErro } from "./EstadoErro";

interface Props {
  onSaved: (msg: string) => void;
  onError: (msg: string) => void;
}

export function ContaCard({ onSaved, onError }: Props) {
  const [atual, setAtual] = useState("");
  const [nova, setNova] = useState("");
  const [nova2, setNova2] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  function validar(): string | null {
    if (!atual) return "Escreve a palavra-passe atual para confirmar que és tu.";
    if (nova.length < 6) return "A nova palavra-passe precisa de pelo menos 6 caracteres.";
    if (nova !== nova2) return "A repetição não coincide com a nova palavra-passe.";
    if (nova === atual) return "A nova palavra-passe é igual à atual. Escolhe outra.";
    return null;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro("");
    const problema = validar();
    if (problema) {
      setErro(problema);
      return;
    }
    setSalvando(true);
    try {
      await api("/api/auth/password", { method: "POST", body: JSON.stringify({ atual, nova }) });
      onSaved("Palavra-passe alterada. Vais continuar com a sessão iniciada.");
      setAtual("");
      setNova("");
      setNova2("");
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao alterar palavra-passe.");
      onError(err instanceof Error ? err.message : "Erro ao alterar palavra-passe.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Card>
      <CardContent className="p-4">
        <h2 className="mb-1 text-lg font-semibold" style={{ fontFamily: "Georgia, serif" }}>A minha conta</h2>
        <p className="text-sm text-[var(--muted-foreground)]">
          O painel tem uma única conta de dono. Aqui só mudas a palavra-passe.
        </p>

        {erro && <EstadoErro titulo="Não foi possível alterar a palavra-passe" mensagem={erro} />}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pass-atual">Palavra-passe atual</Label>
            <Input id="pass-atual" type="password" autoComplete="current-password" value={atual} onChange={(e) => setAtual(e.target.value)} />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="pass-nova">Nova palavra-passe</Label>
              <Input id="pass-nova" type="password" autoComplete="new-password" value={nova} onChange={(e) => setNova(e.target.value)} />
              <Dica>Mínimo 6 caracteres. Usa algo que não uses noutros lados.</Dica>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pass-nova2">Repetir nova</Label>
              <Input id="pass-nova2" type="password" autoComplete="new-password" value={nova2} onChange={(e) => setNova2(e.target.value)} />
              <Dica>Tem de ser igual à anterior, senão nada é guardado.</Dica>
            </div>
          </div>
          <Button variant="outline" type="submit" disabled={salvando}>
            {salvando ? "A alterar…" : "Alterar palavra-passe"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
