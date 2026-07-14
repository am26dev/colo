import { EditableText } from "../../edit-mode/EditableText";
import { Reveal } from "../ui/Reveal";

const BENEFICIO_INDEXES = [0, 1, 2, 3, 4];

const ICONS = [
  <svg key="heart" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>,
  <svg key="leaf" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.9C15.5 4.9 17 3.5 19 2c1 2 2 4.5 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>,
  <svg key="chef" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"/><line x1="6" y1="17" x2="18" y2="17"/></svg>,
  <svg key="truck" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><circle cx="19" cy="18" r="2"/><circle cx="7" cy="18" r="2"/><path d="M9 18h5"/><path d="M16 8h4l2 4v4h-2"/></svg>,
  <svg key="map" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>,
];

export function Sobre() {
  return (
    <section id="sobre" className="section" style={{ background: "var(--cream-3)" }}>
      <div className="container" style={{ padding: "clamp(72px, 10vw, 120px) 28px" }}>
        <Reveal className="text-center" style={{ maxWidth: "48rem", margin: "0 auto" }}>
          <p className="eyebrow"><EditableText contentKey="sobre.eyebrow" /></p>
          <h2>
            <EditableText contentKey="sobre.title.pre" />
            <em className="accent"><EditableText contentKey="sobre.title.em" /></em>
            <EditableText contentKey="sobre.title.post" />
          </h2>
          <p style={{ marginTop: "1.5rem", fontSize: "1.125rem", lineHeight: 1.75, color: "var(--muted)" }}>
            <EditableText contentKey="sobre.subtitle" multiline />
          </p>
        </Reveal>

        <div style={{
          marginTop: "3.5rem",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "1.25rem",
        }}>
          {BENEFICIO_INDEXES.map((i) => (
            <Reveal key={i} delay={((i % 3) + 1) as 1 | 2 | 3}>
              <div className="soft-card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "0.75rem", height: "100%" }}>
                <div style={{
                  display: "grid",
                  width: "2.75rem",
                  height: "2.75rem",
                  placeItems: "center",
                  borderRadius: "50%",
                  background: "rgba(226, 184, 176, 0.4)",
                  color: "var(--rose-deep)",
                }}>
                  {ICONS[i]}
                </div>
                <h3 style={{ fontFamily: "var(--serif)", fontSize: "1.25rem", color: "var(--brown-dark)" }}>
                  <EditableText contentKey={`beneficios.${i}.titulo`} />
                </h3>
                <p style={{ fontSize: "0.9375rem", lineHeight: 1.6, color: "var(--muted)" }}>
                  <EditableText contentKey={`beneficios.${i}.texto`} multiline />
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
