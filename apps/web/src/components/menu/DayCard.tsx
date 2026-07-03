import { Reveal } from "../ui/Reveal";
import { diasSemanaLabels, refeicaoLabels, refeicaoOrdem } from "../../data/data";
import type { Day } from "../../types";

interface DayCardProps {
  dia: Day;
  delay?: 1 | 2 | 3;
}

export function DayCard({ dia, delay }: DayCardProps) {
  const refeicoesPorTipo = new Map(dia.refeicoes.map((r) => [r.tipo, r]));

  return (
    <Reveal as="article" delay={delay} className="day-card">
      <div className="day-card-head">
        {/* <span className="day-card-icon">{dia.icone || "🍽️"}</span> */}
        <div>
          <h3>{diasSemanaLabels[dia.diaSemana] ?? `Dia ${dia.diaSemana}`}</h3>
          {dia.tema && <p className="day-card-tema">{dia.tema}</p>}
        </div>
      </div>

      <ul className="day-card-refeicoes">
        {refeicaoOrdem.map((tipo) => {
          const r = refeicoesPorTipo.get(tipo);
          if (!r || !r.nome) return null;
          return (
            <li key={tipo}>
              <span className="refeicao-tipo">{refeicaoLabels[tipo]}</span>
              <span className="refeicao-nome">{r.nome}</span>
              {r.descricao && <span className="refeicao-desc">{r.descricao}</span>}
            </li>
          );
        })}
      </ul>

      {dia.frase && <p className="day-card-frase">💛 {dia.frase}</p>}
    </Reveal>
  );
}
