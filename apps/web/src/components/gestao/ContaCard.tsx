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
  /** Email que o servidor tem em conta. Vem do token, não de um campo guardado no browser. */
  email: string;
}

/**
 * Os dados de acesso: email e palavra-passe.
 *
 * As duas coisas se autenticam com a palavra-passe atual. Não é redundância
 * burocrática: quem chegue a este ecrã pode não ser a dona (sessão aberta num
 * portátil partilhado, por exemplo), e quem roubar a sessão não fica com a conta
 * nem com a forma de recuperar o acesso.
 */
export function ContaCard({ onSaved, onError, email }: Props) {
  const [atual, setAtual] = useState("");
  const [nova, setNova] = useState("");
  const [nova2, setNova2] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  const [novoEmail, setNovoEmail] = useState("");
  const [passEmail, setPassEmail] = useState("");
  const [salvandoEmail, setSalvandoEmail] = useState(false);
  const [erroEmail, setErroEmail] = useState("");

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
      const msg = err instanceof Error ? err.message : "Erro ao alterar palavra-passe.";
      setErro(msg);
      onError(msg);
    } finally {
      setSalvando(false);
    }
  }

  async function handleEmail(e: FormEvent) {
    e.preventDefault();
    setErroEmail("");
    if (!passEmail) {
      setErroEmail("Escreve a palavra-passe atual para confirmar que és tu.");
      return;
    }
    if (novoEmail.trim().toLowerCase() === email.toLowerCase()) {
      setErroEmail("Esse já é o teu email.");
      return;
    }
    setSalvandoEmail(true);
    try {
      await api("/api/auth/email", { method: "POST", body: JSON.stringify({ atual: passEmail, email: novoEmail }) });
      onSaved(`Email alterado. A partir de agora entras com ${novoEmail.trim().toLowerCase()}.`);
      setNovoEmail("");
      setPassEmail("");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao alterar o email.";
      setErroEmail(msg);
      onError(msg);
    } finally {
      setSalvandoEmail(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <h2 className="mb-1 text-lg font-semibold" style={{ fontFamily: "Georgia, serif" }}>Palavra-passe</h2>
          <p className="text-sm text-[var(--muted-foreground)]">
            É com esta que entras no painel. Convém ser diferente de qualquer senha que uses noutros sítios.
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

      <Card>
        <CardContent className="p-4">
          <h2 className="mb-1 text-lg font-semibold" style={{ fontFamily: "Georgia, serif" }}>Email de acesso</h2>
          <p className="text-sm text-[var(--muted-foreground)]">
            Entras com <strong className="text-[var(--foreground)]">{email}</strong> e, se te esqueceres da palavra-passe,
            é para este endereço que o site manda o link de recuperação.
          </p>

          {erroEmail && <EstadoErro titulo="Não foi possível alterar o email" mensagem={erroEmail} />}

          <form onSubmit={handleEmail} className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email-novo">Email novo</Label>
              <Input
                id="email-novo"
                type="email"
                autoComplete="email"
                placeholder="o-teu-novo@email.com"
                value={novoEmail}
                onChange={(e) => setNovoEmail(e.target.value)}
              />
              <Dica>
                O link de recuperação passa a ir para o novo. Confirma que o endereço está certo antes de mudar.
              </Dica>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email-pass">Palavra-passe atual</Label>
              <Input
                id="email-pass"
                type="password"
                autoComplete="current-password"
                value={passEmail}
                onChange={(e) => setPassEmail(e.target.value)}
              />
            </div>
            <Button variant="outline" type="submit" disabled={salvandoEmail}>
              {salvandoEmail ? "A alterar…" : "Alterar email"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
