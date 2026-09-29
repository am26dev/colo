import { ContaCard } from "../../components/gestao/ContaCard";
import { toast } from "../../components/ui/sonner";
import { PainelHeader } from "../../components/gestao/PainelHeader";
import { Ajuda } from "../../components/gestao/Ajuda";

export default function ContaPage() {
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
            <li><strong>Faz</strong> — mudar a palavra-passe de quem entra no painel, depois de confirmar a atual.</li>
            <li><strong>Não faz</strong> — não muda o email de acesso, não cria contas novas e não envia pedidos de recuperação. Existe uma única conta de dono.</li>
            <li>Se te esqueceres da palavra-passe, não há forma de a recuperar pelo site: precisas de quem tem acesso ao servidor.</li>
            <li>Para fechar a sessão, usa o botão <strong>Sair</strong> no canto inferior direito do site.</li>
          </>
        }
      />

      <ContaCard
        onSaved={(msg) => toast(msg, "ok")}
        onError={(msg) => toast(msg, "erro")}
      />
    </>
  );
}
