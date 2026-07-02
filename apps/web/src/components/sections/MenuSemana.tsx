import { menuSecao } from "../../data/data";
import { Reveal } from "../ui/Reveal";
import { DayCard } from "../menu/DayCard";
import { MenuBanner } from "../menu/MenuBanner";
import { fmtPreco } from "../../utils/format";
import type { Week } from "../../types";

interface MenuSemanaProps {
  week: Week | null;
  moeda: string;
}

export function MenuSemana({ week, moeda }: MenuSemanaProps) {
  const vazio = !week || week.estado === "oculto";

  return (
    <section className="section menu" id="menu">
      <div className="container">
        <Reveal as="p" className="eyebrow center">
          {menuSecao.eyebrow}
        </Reveal>
        <Reveal as="h2" delay={1} className="center">
          {menuSecao.titulo}
        </Reveal>
        <Reveal as="p" delay={2} className="section-lead center">
          {menuSecao.subtitulo}
        </Reveal>

        {vazio ? (
          <p className="menu-empty">O menu está a ser preparado. Volta em breve. 💛</p>
        ) : (
          <>
            <Reveal delay={2} className="menu-preco">
              <span className="menu-preco-label">{menuSecao.precoLabel}</span>
              <span className="menu-preco-valor">{fmtPreco(week.precoSemanal, moeda)}</span>
              <span className="menu-preco-nota">{menuSecao.precoNota}</span>
            </Reveal>

            <MenuBanner week={week} />

            <div className="dias-grid">
              {week.dias.map((dia, i) => (
                <DayCard key={dia.diaSemana} dia={dia} delay={((i % 3) + 1) as 1 | 2 | 3} />
              ))}
            </div>
          </>
        )}

        <Reveal as="p" className="menu-note center">
          {menuSecao.nota}
        </Reveal>
      </div>
    </section>
  );
}
