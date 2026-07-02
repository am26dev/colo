import { useState, type FormEvent } from "react";
import { api } from "../../lib/api";
import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Label } from "../ui/label";

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
    <Card>
      <CardContent className="p-4">
        <h2 className="text-lg font-semibold mb-1" style={{ fontFamily: "Georgia, serif" }}>A minha conta</h2>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Palavra-passe atual</Label>
            <Input type="password" autoComplete="current-password" value={atual} onChange={(e) => setAtual(e.target.value)} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nova palavra-passe</Label>
              <Input type="password" autoComplete="new-password" value={nova} onChange={(e) => setNova(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Repetir nova</Label>
              <Input type="password" autoComplete="new-password" value={nova2} onChange={(e) => setNova2(e.target.value)} />
            </div>
          </div>
          <Button variant="outline" type="submit" disabled={salvando}>
            Alterar palavra-passe
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
