import { EditableText } from "../../edit-mode/EditableText";
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
          <EditableText contentKey="menu.eyebrow" />
        </Reveal>
        <Reveal as="h2" delay={1} className="center">
          <EditableText contentKey="menu.title.pre" />
          <span className="accent"><EditableText contentKey="menu.title.em" /></span>
          <EditableText contentKey="menu.title.post" />
        </Reveal>

        {vazio ? (
          <p className="menu-empty">O menu está a ser preparado. Volta em breve. 💛</p>
        ) : (
          <>
            <Reveal delay={2} className="menu-preco">
              <span className="menu-preco-label"><EditableText contentKey="menu.preco.label" /></span>
              <span className="menu-preco-valor">{fmtPreco(week.precoSemanal, moeda)}</span>
            </Reveal>

            <MenuBanner week={week} />

            <div className="dias-grid">
              {week.dias.map((dia, i) => (
                <DayCard key={dia.diaSemana} dia={dia} delay={((i % 3) + 1) as 1 | 2 | 3} />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
