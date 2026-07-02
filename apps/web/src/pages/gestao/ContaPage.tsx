import { ContaCard } from "../../components/gestao/ContaCard";
import { toast } from "../../components/ui/sonner";

export default function ContaPage() {
  return (
    <div>
      <ContaCard
        onSaved={(msg) => toast(msg, "ok")}
        onError={(msg) => toast(msg, "erro")}
      />
    </div>
  );
}
