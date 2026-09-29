import { EditableText } from "../../edit-mode/EditableText";
import { Reveal } from "../ui/Reveal";
import { DayCarousel } from "../ui/carousel";
import { diasSemanaLabels, refeicaoLabels } from "../../data/data";
import type { Day, Refeicao, Week } from "../../types";
import { apiUrl } from "../../lib/api";

interface MenuSemanaProps {
  week: Week | null;
}

const cardStyle: React.CSSProperties = {
  background: "#fff",
  borderRadius: "1.25rem",
  border: "1px solid rgba(238,223,208,0.5)",
  boxShadow: "0 2px 12px rgba(78,46,19,0.06)",
};

/**
 * Marcação para os dias que ainda não têm foto no painel. Um ícone, não uma
 * foto: uma imagem de omissão repetiria o mesmo prato nos cinco dias e a
 * cliente ia achar que era a comida dessa semana. O ícone diz honestamente
 * "ainda sem foto", e o prato só aparece quando a dona o define.
 */
function SemFoto() {
  return (
    <div className="dia-card-sem-foto" role="img" aria-label="Sem foto definida">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="56"
        height="56"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
        <path d="M7 2v20" />
        <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
      </svg>
    </div>
  );
}

function RefeicaoCard({
  refeicao,
  foto,
}: {
  refeicao: Refeicao;
  /** Só a sobremesa tem foto no cartão: a do almoço já está no topo. */
  foto?: string;
}) {
  return (
    <div className="dia-card-refeicao">
      <div className="dia-card-refeicao-label">
        {refeicao.tipo === "almoco" ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 0 0-7.35 16.76C6.23 17.1 9.02 14 12 14s5.77 3.1 7.35 4.76A10 10 0 0 0 12 2Z"/><path d="M12 14a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"/></svg>
        )}
        {refeicaoLabels[refeicao.tipo]}
      </div>
      <p className="dia-card-refeicao-nome">{refeicao.nome}</p>
      {refeicao.descricao && <p className="dia-card-refeicao-desc">{refeicao.descricao}</p>}
      {foto && (
        <img
          src={apiUrl(foto)}
          alt={refeicao.nome}
          className="dia-card-refeicao-foto"
          loading="lazy"
        />
      )}
    </div>
  );
}

/**
 * O dia inteiro no cartão: nome do dia, almoço e momento doce com descrição.
 * Sem modal e sem "ver detalhes" — a cliente lê tudo sem clicar.
 */
function DiaCard({ dia }: { dia: Day }) {
  const almoco = dia.refeicoes.find((r) => r.tipo === "almoco");
  const sobremesa = dia.refeicoes.find((r) => r.tipo === "sobremesa");

  return (
    <article className="dia-card" style={cardStyle}>
      <div className="dia-card-media">
        {almoco?.foto ? (
          <img
            src={apiUrl(almoco.foto)}
            alt={almoco.nome}
            width={512}
            height={384}
            className="aspect-[4/3] w-full object-cover"
          />
        ) : (
          <SemFoto />
        )}
        {dia.tema && <div className="dia-card-media-tema">{dia.tema}</div>}
      </div>

      <div className="dia-card-corpo">
        <div className="dia-card-cabecalho">
          <h3 className="dia-card-nome">
            {diasSemanaLabels[dia.diaSemana] ?? `Dia ${dia.diaSemana}`}
          </h3>
        </div>

        {dia.frase && <p className="dia-card-frase">{dia.frase}</p>}

        <div className="dia-card-refeicoes">
          {almoco?.nome && <RefeicaoCard refeicao={almoco} />}
          {sobremesa?.nome && <RefeicaoCard refeicao={sobremesa} foto={sobremesa.foto} />}
        </div>
      </div>
    </article>
  );
}

export function MenuSemana({ week }: MenuSemanaProps) {
  const dias = week?.dias ?? [];

  return (
    <section id="menu" className="section" style={{ background: "var(--cream-3)" }}>
      <div className="container" style={{ padding: "clamp(72px, 10vw, 120px) 28px" }}>
        <div
          style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "space-between", gap: "1.5rem" }}
          className="md:flex-row md:items-end"
        >
          <div>
            <h2>
              <EditableText contentKey="menu.title.pre" />
              <span className="accent">
                <EditableText contentKey="menu.title.em" />
              </span>
              <EditableText contentKey="menu.title.post" />
            </h2>
            <p className="eyebrow" style={{ marginTop: "0.9rem" }}>
              <EditableText contentKey="menu.eyebrow" />
            </p>
          </div>
          <div style={{ borderRadius: "1rem", background: "var(--brown)", padding: "1rem 1.5rem", color: "var(--cream-3)", flexShrink: 0 }}>
            <div style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.2em", opacity: 0.8 }}>
              <EditableText contentKey="menu.preco.label" />
            </div>
            <div style={{ fontFamily: "var(--sans)", fontSize: "1.75rem", fontWeight: 600 }}>
              <EditableText contentKey="menu.preco.valor" />
            </div>
            <div style={{ marginTop: "0.25rem", fontSize: "0.6875rem", letterSpacing: "0.04em", opacity: 0.72 }}>
              5 dias • almoço + momento doce • entregas diárias
            </div>
          </div>
        </div>

        <Reveal delay={1} as="p" className="menu-semana-nota">
          <EditableText contentKey="nota.mensagem" multiline />
        </Reveal>

        <div style={{ marginTop: "3rem", ...cardStyle, padding: "1.5rem" }}>
          <DayCarousel>
            {dias.map((dia) => (
              <DiaCard key={dia.diaSemana} dia={dia} />
            ))}
          </DayCarousel>
        </div>
      </div>
    </section>
  );
}
