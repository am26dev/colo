import { comoFunciona } from "../../data/data";
import { Reveal } from "../ui/Reveal";

export function ComoFunciona() {
  return (
    <section className="section como" id="como-funciona">
      <div className="container">
        <Reveal as="p" className="eyebrow center">
          {comoFunciona.eyebrow}
        </Reveal>
        <Reveal as="h2" delay={1} className="center">
          {comoFunciona.titulo}
        </Reveal>

        <ol className="steps">
          {comoFunciona.passos.map((s) => (
            <Reveal as="li" key={s.n} delay={s.n as 1 | 2 | 3 | 4}>
              <span className="step-n">{s.n}</span>
              <h3>{s.titulo}</h3>
              <p>{s.texto}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
