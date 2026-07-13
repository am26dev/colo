import { EditableText } from "../../edit-mode/EditableText";
import { EditableImage } from "../../edit-mode/EditableImage";

const GALERIA_INDEXES = [0, 1, 2, 3, 4];

export function Galeria() {
  return (
    <section className="section" style={{ background: "var(--cream)" }}>
      <div className="container">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end" style={{ marginBottom: "2.5rem" }}>
          <div>
            <p className="eyebrow"><EditableText contentKey="galeria.eyebrow" /></p>
            <h2><EditableText contentKey="galeria.title" /></h2>
          </div>
          <p style={{ maxWidth: "28rem", color: "var(--muted)", lineHeight: 1.75 }}>
            <EditableText contentKey="galeria.subtitle" multiline />
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {GALERIA_INDEXES.map((i) => (
            <figure
              key={i}
              className={`overflow-hidden rounded-3xl bg-white ${i === 0 ? "md:col-span-2 md:row-span-2" : ""}`}
            >
              <EditableImage
                contentKey={`galeria.${i}.image`}
                altKey={`galeria.${i}.label`}
                width={1024}
                height={1024}
                className="aspect-square h-full w-full object-cover transition-transform duration-500 hover:scale-[1.03]"
              />
              <figcaption style={{ padding: "0.75rem 1rem", fontSize: "0.8125rem", color: "var(--muted)" }}>
                <EditableText contentKey={`galeria.${i}.label`} />
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
