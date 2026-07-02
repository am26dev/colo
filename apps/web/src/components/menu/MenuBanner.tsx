import { Reveal } from "../ui/Reveal";
import type { Week } from "../../types";
import { pedidosAbertos, vagasRestantes } from "../../utils/format";

export function MenuBanner({ week }: { week: Week }) {
  const aberto = pedidosAbertos(week);
  const v = vagasRestantes(week);
  const total = Number(week.vagasTotais);

  return (
    <Reveal delay={2} className={`menu-banner${aberto ? "" : " is-closed"}`}>
      {aberto ? (
        <>
          {v !== null ? (
            <span className="vagas">
              {v}
              {!Number.isNaN(total) ? `/${total}` : ""}
            </span>
          ) : null}{" "}
          {v !== null ? "vagas ainda disponíveis" : "Pedidos abertos"} — reserva o teu menu desta semana.
        </>
      ) : (
        <>
          <strong>Pedidos encerrados</strong> — o menu continua aqui para veres. Volta na próxima semana ou fala
          connosco. 💛
        </>
      )}
    </Reveal>
  );
}
