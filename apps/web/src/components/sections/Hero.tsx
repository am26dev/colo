import { hero } from "../../data/data";
import { Reveal } from "../ui/Reveal";
import { pedidosAbertos, vagasRestantes } from "../../utils/format";
import { montarMensagemHero, whatsappLink } from "../../utils/whatsapp";
import type { Week } from "../../types";

interface HeroProps {
  week: Week | null;
  whatsapp: string;
}

export function Hero({ week, whatsapp }: HeroProps) {
  const aberto = week ? pedidosAbertos(week) : false;
  const v = week ? vagasRestantes(week) : null;
  const statusText = !week
    ? "Menu a ser preparado"
    : !aberto
      ? "Pedidos encerrados esta semana"
      : v !== null
        ? ` ${v === 1 ?
          "vaga disponível" : "vagas disponíveis"} esta semana`
        : "Pedidos abertos esta semana";

  return (
    <section className="hero">
      <span className="blob blob-1" aria-hidden="true"></span>
      <span className="blob blob-2" aria-hidden="true"></span>
      <div className="container hero-inner">
        <div className="hero-copy">
          <Reveal as="h1" delay={1}>
            {hero.titulo}
            <span className="accent">{hero.tituloDestaque}</span>
            {hero.tituloFim}
          </Reveal>
          <Reveal as="p" delay={2} className="lead">
            {hero.lead}
          </Reveal>

          <Reveal delay={3} className={`hero-status${aberto ? "" : " is-closed"}`}>
            <span className="dot"></span>
            <span>{statusText}</span>
          </Reveal>

          <Reveal delay={4} className="hero-actions">
            <a href="#menu" className="btn btn-primary">
              {hero.cta1}
            </a>
            <a
              href="#pedido"
              className="btn btn-ghost"
              onClick={(e) => {
                e.preventDefault();
                window.open(whatsappLink(whatsapp, montarMensagemHero(week)), "_blank");
              }}
            >
              {hero.cta2}
            </a>
          </Reveal>
        </div>

        <Reveal delay={2} className="hero-card">
          <div className="hero-photo">
            <img src="/assets/img/hero.jpg" alt={hero.fotoAlt} loading="eager" />
          </div>
          <div className="hero-seal">
            <p>
              {hero.selo.linha1}
              <br />
              {hero.selo.linha2}
              <br />
              {hero.selo.linha3}
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
