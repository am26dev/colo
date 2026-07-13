import { EditableText } from "../../edit-mode/EditableText";
import { useEditMode } from "../../edit-mode/EditModeProvider";
import { Reveal } from "../ui/Reveal";

const INCLUIDO_INDEXES = [0, 1, 2, 3, 4, 5];

export function Incluido() {
  const { get } = useEditMode();
  return (
    <section className="section" style={{ background: "var(--cream)" }}>
      <div className="container">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <Reveal delay={1}>
            <p className="eyebrow"><EditableText contentKey="incluido.eyebrow" /></p>
            <h2><EditableText contentKey="incluido.title" /></h2>
            <ul style={{ marginTop: "2rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", listStyle: "none", padding: 0 }}>
              {INCLUIDO_INDEXES.map((i) => (
                <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                  <span style={{
                    marginTop: "0.125rem",
                    display: "grid",
                    width: "1.5rem",
                    height: "1.5rem",
                    placeItems: "center",
                    borderRadius: "50%",
                    background: "rgba(125, 145, 120, 0.25)",
                    color: "var(--sage)",
                    flexShrink: 0,
                    fontSize: "0.75rem",
                  }}>✓</span>
                  <span style={{ fontSize: "0.9375rem", lineHeight: 1.6 }}>
                    <EditableText contentKey={`incluido.${i}`} />
                  </span>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={2}>
            <div className="soft-card p-8 text-center md:p-10">
              <div style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.22em", color: "var(--muted)" }}>
                <EditableText contentKey="incluido.card.eyebrow" />
              </div>
              <div style={{ marginTop: "0.75rem", fontFamily: "var(--serif)", fontSize: "3.5rem", color: "var(--brown-dark)" }}>
                {get("menu.preco.valor")}
              </div>
              <div style={{ marginTop: "0.25rem", fontSize: "0.9375rem", color: "var(--muted)" }}>
                <EditableText contentKey="incluido.card.detalhe" />
              </div>
              <a href="#pedido" className="btn btn-primary" style={{ marginTop: "1.5rem", width: "100%", justifyContent: "center" }}>
                <EditableText contentKey="incluido.card.cta" />
              </a>
              <div style={{ marginTop: "1rem", fontSize: "0.8125rem", color: "var(--muted)" }}>
                <EditableText contentKey="incluido.card.nota" />
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
