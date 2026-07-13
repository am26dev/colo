import { EditableText } from "../../edit-mode/EditableText";

export function Citacao() {
  return (
    <section className="section" style={{ background: "var(--brown-dark)", color: "var(--cream-3)" }}>
      <div className="container" style={{ textAlign: "center", padding: "3rem 0" }}>
        <div style={{ fontFamily: "var(--script)", fontSize: "3rem", color: "var(--rose-soft)" }}>
          <EditableText contentKey="citacao.brand" />
        </div>
        <blockquote style={{
          marginTop: "2rem",
          fontFamily: "var(--serif)",
          fontSize: "clamp(1.25rem, 3vw, 1.75rem)",
          lineHeight: 1.5,
          maxWidth: "48rem",
          marginLeft: "auto",
          marginRight: "auto",
          fontStyle: "italic",
        }}>
          <em>
            <EditableText contentKey="citacao.texto" multiline />
          </em>
        </blockquote>
      </div>
    </section>
  );
}
