import { EditableText } from "../../edit-mode/EditableText";

export function Citacao() {
  return (
    <section className="section" style={{ background: "var(--brown-dark)", color: "var(--cream-3)" }}>
      <div className="container" style={{ textAlign: "center", padding: "3rem 0" }}>
        <img src="/assets/img/logo-footer.webp" alt="Colo" style={{ width: "150px", height: "auto", margin: "0 auto" }} />
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
          <EditableText as="em" contentKey="citacao.texto" multiline />
        </blockquote>
      </div>
    </section>
  );
}
