import { EditableText } from "../../edit-mode/EditableText";
import { EditableImage } from "../../edit-mode/EditableImage";
import { Reveal } from "../ui/Reveal";

export function Fundadora() {
  return (
    <section className="section" style={{ background: "var(--cream-2)" }}>
      <div className="container">
        <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-[0.9fr_1.1fr]">
          <Reveal delay={1}>
            <div style={{ position: "relative" }}>
              <div className="overflow-hidden rounded-[2.5rem] shadow-[0_25px_50px_-30px_rgba(78,46,19,0.5)]">
                <EditableImage
                  contentKey="fundadora.image"
                  altKey="fundadora.image.alt"
                  width={1024}
                  height={1024}
                  className="h-full w-full object-cover"
                />
              </div>
              <div style={{
                position: "absolute",
                bottom: "-1rem",
                left: "1.5rem",
                borderRadius: "9999px",
                background: "var(--brown)",
                padding: "0.5rem 1.25rem",
                fontSize: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.2em",
                color: "var(--cream-3)",
              }}>
                <EditableText contentKey="fundadora.badge" />
              </div>
            </div>
          </Reveal>

          <Reveal delay={2}>
            <p className="eyebrow"><EditableText contentKey="fundadora.eyebrow" /></p>
            <h2>
              <EditableText contentKey="fundadora.title.pre" />
              <span className="accent"><EditableText contentKey="fundadora.title.em" /></span>
              <EditableText contentKey="fundadora.title.post" />
            </h2>
            <div style={{ marginTop: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem", color: "var(--muted)", lineHeight: 1.75, fontSize: "1.05rem" }}>
              <p><EditableText contentKey="fundadora.p1" multiline /></p>
              <p><EditableText contentKey="fundadora.p2" multiline /></p>
              <p><EditableText contentKey="fundadora.p3" multiline /></p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
