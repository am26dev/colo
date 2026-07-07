import { sobre } from "../../data/data";
import { Reveal } from "../ui/Reveal";

const CORES = ["rose", "sage", "terra"] as const;

export function Sobre() {
  return (
    <section className="section sobre" id="sobre">
      <div className="container">
        <Reveal as="p" className="eyebrow center">
          {sobre.eyebrow}
        </Reveal>
        <Reveal as="h2" delay={1} className="center">
          {sobre.titulo}
        </Reveal>
        <Reveal as="p" delay={2} className="section-lead center">
          {sobre.lead}
        </Reveal>
        <Reveal as="p" delay={3} className="conceito-frase center">
          {sobre.frase}
        </Reveal>

        <Reveal as="figure" delay={1} className="sobre-photo">
          <img src="/assets/img/comida1.jpeg" alt={sobre.fotoAlt} loading="lazy" />
        
        </Reveal>

        <div className="pillars">
          {sobre.pilares.map((p, i) => (
            <Reveal
              as="article"
              key={p.titulo}
              delay={(i + 1) as 1 | 2 | 3}
              className={`pillar pillar-${CORES[i]}`}
            >
              <span className="pillar-icon">{p.icon}</span>
              <h3>{p.titulo}</h3>
              <p>{p.texto}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
