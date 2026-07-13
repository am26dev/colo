import { EditableText } from "../../edit-mode/EditableText";
import { Reveal } from "../ui/Reveal";

const TESTEMUNHO_INDEXES = [0, 1, 2, 3, 4];

const testemunhosData = [
  { nome: "Maria S.", iniciais: "MS", texto: "Finalmente deixei de pensar no almoço. Sinto que alguém cuida de mim durante a semana." },
  { nome: "Isabel N.", iniciais: "IN", texto: "A comida chega bonita, cheira a casa. Parece feita pela minha mãe, mas com mais leveza." },
  { nome: "Tânia P.", iniciais: "TP", texto: "Trabalho até tarde e a Colo devolveu-me as noites. Já não como take-away há dois meses." },
  { nome: "Célia M.", iniciais: "CM", texto: "É saudável sem ser aborrecido. Adoro que tenha sempre uma sobremesa reconfortante." },
  { nome: "Ana F.", iniciais: "AF", texto: "Recomendo às minhas amigas. O cuidado nota-se em tudo, desde a embalagem ao sabor." },
];

export function Testemunhos() {
  return (
    <section className="section" style={{ background: "var(--cream-3)" }}>
      <div className="container">
        <Reveal className="text-center" style={{ maxWidth: "32rem", margin: "0 auto" }}>
          <p className="eyebrow"><EditableText contentKey="testemunhos.eyebrow" /></p>
          <h2>
            <EditableText contentKey="testemunhos.title.pre" />
            <span className="accent"><EditableText contentKey="testemunhos.title.em" /></span>
            <EditableText contentKey="testemunhos.title.post" />
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {TESTEMUNHO_INDEXES.map((i) => (
            <Reveal key={i} delay={((i % 3) + 1) as 1 | 2 | 3}>
              <figure className="soft-card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem", height: "100%" }}>
                <div style={{ display: "flex", gap: "0.25rem", color: "var(--rose-dark)" }}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <span key={j}>★</span>
                  ))}
                </div>
                <blockquote style={{ fontFamily: "var(--serif)", fontSize: "1.125rem", lineHeight: 1.4, color: "var(--ink)" }}>
                  “{testemunhosData[i].texto}”
                </blockquote>
                <figcaption style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: "0.75rem", paddingTop: "0.5rem" }}>
                  <div style={{
                    display: "grid",
                    width: "2.5rem",
                    height: "2.5rem",
                    placeItems: "center",
                    borderRadius: "50%",
                    background: "var(--cream-2)",
                    fontFamily: "var(--serif)",
                    fontSize: "0.875rem",
                    color: "var(--brown)",
                  }}>
                    {testemunhosData[i].iniciais}
                  </div>
                  <div style={{ fontSize: "0.9375rem", color: "var(--muted)" }}>
                    {testemunhosData[i].nome}
                  </div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
