import { EditableText } from "../../edit-mode/EditableText";
import { Reveal } from "../ui/Reveal";

const PASSO_INDEXES = [0, 1, 2, 3];

export function ComoFunciona() {
  return (
    <section className="section como" id="como-funciona">
      <div className="container">
        <Reveal as="p" className="eyebrow center">
          <EditableText contentKey="como.eyebrow" />
        </Reveal>
        <Reveal as="h2" delay={1} className="center">
          <EditableText contentKey="como.title.pre" />
          <span className="accent"><EditableText contentKey="como.title.em" /></span>
          <EditableText contentKey="como.title.post" />
        </Reveal>

        <ol className="steps">
          {PASSO_INDEXES.map((i) => (
            <Reveal as="li" key={i} delay={(i + 1) as 1 | 2 | 3 | 4}>
              <span className="step-n">
                <EditableText contentKey={`passos.${i}.numero`} />
              </span>
              <h3><EditableText contentKey={`passos.${i}.titulo`} /></h3>
              <p><EditableText contentKey={`passos.${i}.texto`} multiline /></p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
