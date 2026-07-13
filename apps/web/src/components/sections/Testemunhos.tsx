import { EditableText } from "../../edit-mode/EditableText";
import { useEditMode } from "../../edit-mode/EditModeProvider";
import { Reveal } from "../ui/Reveal";

const TESTEMUNHO_INDEXES = [0, 1, 2, 3, 4];

function iniciaisDe(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  const letras = [partes[0]?.[0], partes[partes.length - 1]?.[0]].filter(Boolean);
  return letras.join("").toUpperCase() || "?";
}

export function Testemunhos() {
  const { get } = useEditMode();
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
                <div style={{ display: "flex", gap: "0.25rem", color: "var(--rose-deep)" }}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <span key={j}>★</span>
                  ))}
                </div>
                <blockquote style={{ fontFamily: "var(--serif)", fontSize: "1.125rem", lineHeight: 1.4, color: "var(--ink)" }}>
                  “<EditableText contentKey={`testemunhos.${i}.texto`} multiline />”
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
                    {iniciaisDe(get(`testemunhos.${i}.nome`))}
                  </div>
                  <div style={{ fontSize: "0.9375rem", color: "var(--muted)" }}>
                    <EditableText contentKey={`testemunhos.${i}.nome`} />
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
