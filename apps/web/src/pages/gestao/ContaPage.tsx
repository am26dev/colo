import { useEffect, useState } from "react";
import { ContaCard } from "../../components/gestao/ContaCard";
import { toast } from "../../components/ui/sonner";
import { PainelHeader } from "../../components/gestao/PainelHeader";
import { Ajuda } from "../../components/gestao/Ajuda";
import { EstadoErro } from "../../components/gestao/EstadoErro";
import { api } from "../../lib/api";

export default function ContaPage() {
  const [email, setEmail] = useState("");
  const [erro, setErro] = useState("");

  // Vai ao servidor em vez de guardar o email no browser: depois de o mudar, a
  // página tem de mostrar o novo, e não o que ficou em cache de uma visita
  // anterior. É uma chamada pequena, a um ecrã que se abre uma vez por visita.
  useEffect(() => {
    api<{ email: string }>("/api/auth/me")
      .then((d) => setEmail(d.email))
      .catch((e) => setErro(e instanceof Error ? e.message : "Não foi possível ler os teus dados."));
  }, []);

  return (
    <>
      <PainelHeader
        titulo="Conta"
        descricao="A segurança da tua entrada no painel."
      />

      <Ajuda
        titulo="O que esta área faz — e o que não faz"
        itens={
          <>
            <li><strong>Faz</strong> — mudar a palavra-passe e o email com que entras, sempre depois de confirmar a senha atual.</li>
            <li><strong>Não faz</strong> — não cria contas novas. Existe uma única conta de dono.</li>
            <li>O email é também para onde vai o link de recuperação. Se mudares de email, o link passa a ir para o novo — e o endereço antigo deixa de servir para entrar.</li>
            <li>Se te esqueceres da palavra-passe, há um link para a pedir em <strong>Entrar → Esqueci-me da palavra-passe</strong>. Só funciona com a sessão fechada.</li>
            <li>Para fechar a sessão, usa o botão <strong>Sair</strong> no canto inferior direito do site.</li>
          </>
        }
      />

      {erro ? (
        <EstadoErro titulo="Não foi possível mostrar a tua conta" mensagem={erro} />
      ) : (
        <ContaCard
          email={email}
          onSaved={(msg) => {
            toast(msg, "ok");
            // O email mostrado acima do formulário tem de mudar com a conta;
            // se ficasse no anterior, a dona lia o endereço velho e achava que
            // a mudança não pegou.
            api<{ email: string }>("/api/auth/me").then((d) => setEmail(d.email)).catch(() => {});
          }}
          onError={(msg) => toast(msg, "erro")}
        />
      )}
    </>
  );
}
