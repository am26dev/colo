import { EditableText } from "../../edit-mode/EditableText";
import { EditableImage } from "../../edit-mode/EditableImage";
import { Reveal } from "../ui/Reveal";
import { montarMensagemHero, whatsappLink } from "../../utils/whatsapp";
import type { Week } from "../../types";

interface HeroProps {
  week: Week | null;
  whatsapp: string;
}

export function Hero({ week, whatsapp }: HeroProps) {
  return (
    <section className="hero">
      <span className="blob blob-1" aria-hidden="true"></span>
      <span className="blob blob-2" aria-hidden="true"></span>
      <div className="container hero-inner">
        <div className="hero-copy">
          <Reveal as="h1" delay={1}>
            <EditableText contentKey="hero.title.pre" />
            <span className="accent"><EditableText contentKey="hero.title.em" /></span>
            <EditableText contentKey="hero.title.post" />
          </Reveal>
          <Reveal as="p" delay={2} className="lead">
            <EditableText contentKey="hero.subtitle" multiline />
          </Reveal>

     <Reveal delay={4} className="hero-actions">
            <a href="#menu" className="btn btn-primary">
              <EditableText contentKey="hero.cta.primary" />
            </a>
            <a
              href="#pedido"
              className="btn btn-ghost"
              onClick={(e) => {
                e.preventDefault();
                window.open(whatsappLink(whatsapp, montarMensagemHero(week)), "_blank");
              }}
            >
              <EditableText contentKey="hero.cta.secondary" />
            </a>
          </Reveal>
        </div>

        <Reveal delay={2} className="hero-card">
          <div className="hero-photo">
            <EditableImage contentKey="hero.image" altKey="hero.image.alt" className="h-full w-full object-cover" loading="eager" />
          </div>
          <div className="hero-seal">
            <p>
              <EditableText contentKey="hero.stamp" />
            </p>
          </div>
          <div className="hero-floater">
            <p><EditableText contentKey="hero.floater.title" /></p>
            <span><EditableText contentKey="hero.floater.subtitle" /></span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
