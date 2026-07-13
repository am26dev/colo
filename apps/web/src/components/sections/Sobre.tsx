import { EditableText } from "../../edit-mode/EditableText";
import { Reveal } from "../ui/Reveal";

const CORES = ["rose", "sage", "terra"] as const;

const BENEFICIO_INDEXES = [0, 1, 2, 3, 4];

export function Sobre() {
  return (
    <section className="section sobre" id="sobre">
      <div className="container">
        <Reveal as="p" className="eyebrow center">
          <EditableText contentKey="sobre.eyebrow" />
        </Reveal>
        <Reveal as="h2" delay={1} className="center">
          <EditableText contentKey="sobre.title.pre" />
          <span className="accent"><EditableText contentKey="sobre.title.em" /></span>
          <EditableText contentKey="sobre.title.post" />
        </Reveal>
        <Reveal as="p" delay={2} className="section-lead center">
          <EditableText contentKey="sobre.subtitle" multiline />
        </Reveal>

        <div className="pillars">
          {BENEFICIO_INDEXES.map((i) => (
            <Reveal
              as="article"
              key={i}
              delay={((i % 3) + 1) as 1 | 2 | 3}
              className={`pillar pillar-${CORES[i % 3]}`}
            >
              <span className="pillar-icon">
                {["🤍", "🌙", "🌿", "🍳", "📍"][i]}
              </span>
              <h3><EditableText contentKey={`beneficios.${i}.titulo`} /></h3>
              <p><EditableText contentKey={`beneficios.${i}.texto`} multiline /></p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
