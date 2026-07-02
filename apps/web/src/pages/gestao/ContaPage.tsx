import { useState } from "react";
import { ContaCard } from "../../components/gestao/ContaCard";

export default function ContaPage() {
  const [flash, setFlash] = useState<{ msg: string; tipo: "ok" | "erro" } | null>(null);

  return (
    <div>
      {flash && <div className={`flash ${flash.tipo}`}>{flash.msg}</div>}
      <ContaCard onSaved={(msg) => setFlash({ msg, tipo: "ok" })} onError={(msg) => setFlash({ msg, tipo: "erro" })} />
    </div>
  );
}
