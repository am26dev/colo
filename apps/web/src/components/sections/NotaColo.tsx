import { Reveal } from "../ui/Reveal";
import { site } from "../../data/data";

export function NotaColo({ mensagem }: { mensagem: string }) {
  if (!mensagem.trim()) return null;
  return (
    <section className="section nota">
      <div className="container">
        <Reveal as="figure" className="note-card">
          <blockquote>“{mensagem}”</blockquote>
          <figcaption>
            Com carinho,{" "}
            <span className="brand-word sm">
              {site.nome}
              <span className="brand-dot"></span>
            </span>
          </figcaption>
        </Reveal>
      </div>
    </section>
  );
}
