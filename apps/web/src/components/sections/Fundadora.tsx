import { EditableText } from "../../edit-mode/EditableText";
import { Reveal } from "../ui/Reveal";

export function Fundadora() {
  return (
    <section className="section" style={{ background: "var(--cream-2)" }}>
      <div className="container">
        <div
          style={{ maxWidth: "46rem", margin: "0 auto", textAlign: "center" }}
        >
          <Reveal delay={1}>
            <p className="eyebrow">
              <EditableText contentKey="fundadora.eyebrow" />
            </p>
            <div
              style={{
                marginTop: "1.5rem",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                color: "var(--muted)",
                lineHeight: 1.75,
                fontSize: "1.05rem",
              }}
            >
              <p>
                <EditableText contentKey="fundadora.p1" multiline />
              </p>
              <p>
                <EditableText contentKey="fundadora.p2" multiline />
              </p>
              <p>
                <EditableText contentKey="fundadora.p3" multiline />
              </p>
            </div>
            <div
              style={{
                marginTop: "1.75rem",
                color: "var(--brown)",
                lineHeight: 1.2,
              }}
            >
              <div style={{ fontSize: "0.9rem", fontStyle: "italic" }}>
                Com carinho,
              </div>
              <div
                style={{
                  marginTop: "0.2rem",
                  fontFamily: "Parisienne, cursive",
                  fontSize: "2.4rem",
                }}
              >
                Winnie
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
