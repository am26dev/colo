import { useState } from "react";
import { EditableText } from "../../edit-mode/EditableText";
import { DayModal } from "../ui/day-modal";
import { DayCarousel } from "../ui/carousel";
import type { Day, Week } from "../../types";
import { apiUrl } from "../../lib/api";

interface MenuSemanaProps {
  week: Week | null;
}

const DIAS_LABELS: Record<number, string> = {
  1: "Segunda",
  2: "Terça",
  3: "Quarta",
  4: "Quinta",
  5: "Sexta",
};

const DIAS_FULL: Record<number, string> = {
  1: "Segunda-feira",
  2: "Terça-feira",
  3: "Quarta-feira",
  4: "Quinta-feira",
  5: "Sexta-feira",
};

const cardStyle: React.CSSProperties = {
  background: "#fff",
  borderRadius: "1.25rem",
  border: "1px solid rgba(238,223,208,0.5)",
  boxShadow: "0 2px 12px rgba(78,46,19,0.06)",
};

function DiaCard({ dia, onClick }: { dia: Day; onClick: () => void }) {
  const almoco = dia.refeicoes.find((r) => r.tipo === "almoco");
  const sobremesa = dia.refeicoes.find((r) => r.tipo === "sobremesa");

  return (
    <button
      type="button"
      onClick={onClick}
      className="group text-left w-full cursor-pointer"
      style={{
        ...cardStyle,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        border: "1px solid rgba(238,223,208,0.5)",
        padding: 0,
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.transform = "translateY(-6px)";
        (e.currentTarget as HTMLElement).style.boxShadow = "0 20px 50px -15px rgba(78,46,19,0.18)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
        (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 12px rgba(78,46,19,0.06)";
      }}
    >
      <div style={{ overflow: "hidden", position: "relative" }}>
        {almoco?.foto ? (
          <img
            src={apiUrl(almoco.foto)}
            alt={almoco.nome}
            width={512}
            height={384}
            className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
          />
        ) : (
          <div className="aspect-[4/3] w-full" style={{ background: "var(--cream-2)" }} />
        )}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(transparent, rgba(0,0,0,0.5))", padding: "2rem 1rem 0.75rem" }}>
          <div style={{ fontSize: "0.6875rem", textTransform: "uppercase", letterSpacing: "0.18em", color: "rgba(255,255,255,0.85)" }}>
            {dia.tema}
          </div>
        </div>
      </div>
      <div style={{ padding: "1.125rem 1.25rem 1.25rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
          <span style={{ fontFamily: "var(--serif)", fontSize: "1.125rem", color: "var(--brown-dark)", fontWeight: 500 }}>
            {DIAS_LABELS[dia.diaSemana]}
          </span>
          <span style={{ fontSize: "0.625rem", textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--rose-deep)", background: "var(--cream-2)", padding: "0.2rem 0.6rem", borderRadius: "999px" }}>
            Dia {dia.diaSemana}
          </span>
        </div>
        {almoco?.nome && (
          <p style={{ fontSize: "0.875rem", color: "var(--ink)", lineHeight: 1.45, margin: 0 }}>
            {almoco.nome}
          </p>
        )}
        {sobremesa?.nome && (
          <p style={{ fontSize: "0.8125rem", color: "var(--muted)", lineHeight: 1.45, margin: "0.25rem 0 0", fontStyle: "italic" }}>
            + {sobremesa.nome}
          </p>
        )}
        <div style={{ marginTop: "0.875rem", display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.75rem", color: "var(--brown)", fontWeight: 600 }}>
          Ver detalhes
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
        </div>
      </div>
    </button>
  );
}

function DiaModal({ dia, open, onClose }: { dia: Day | null; open: boolean; onClose: () => void }) {
  if (!dia) return null;
  const almoco = dia.refeicoes.find((r) => r.tipo === "almoco");
  const sobremesa = dia.refeicoes.find((r) => r.tipo === "sobremesa");

  return (
    <DayModal open={open} onClose={onClose}>
      <div style={{ background: "#fff", borderRadius: "1.5rem", overflow: "hidden", boxShadow: "0 25px 60px -15px rgba(0,0,0,0.25)" }}>
        {almoco?.foto && (
          <div style={{ overflow: "hidden" }}>
            <img src={apiUrl(almoco.foto)} alt={almoco.nome} className="w-full aspect-[16/9] object-cover" />
          </div>
        )}
        <div style={{ padding: "1.75rem 2rem 2rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.125rem" }}>
            <h3 style={{ fontFamily: "var(--serif)", fontSize: "1.5rem", color: "var(--brown-dark)", margin: 0, fontWeight: 600 }}>
              {DIAS_FULL[dia.diaSemana]}
            </h3>
            <button
              type="button"
              onClick={onClose}
              style={{ background: "var(--cream-2)", border: "none", cursor: "pointer", padding: "0.375rem", borderRadius: "999px", color: "var(--muted)", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.2s" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--cream-3)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--cream-2)"; }}
              aria-label="Fechar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>
          <div style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.18em", color: "var(--rose-deep)", marginBottom: "1.25rem" }}>
            {dia.tema}
          </div>
          {dia.frase && (
            <p style={{ fontFamily: "var(--serif)", fontSize: "1rem", fontStyle: "italic", color: "var(--muted)", margin: "0 0 1.5rem", lineHeight: 1.6, padding: "0.75rem 1rem", background: "var(--cream-3)", borderRadius: "0.75rem", borderLeft: "3px solid var(--rose-deep)" }}>
              &ldquo;{dia.frase}&rdquo;
            </p>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {almoco?.nome && (
              <div style={{ background: "var(--cream-3)", borderRadius: "1rem", padding: "1.25rem" }}>
                <div style={{ fontSize: "0.6875rem", textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--muted)", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.375rem" }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>
                  Almoço
                </div>
                <p style={{ fontSize: "1.0625rem", fontWeight: 600, color: "var(--ink)", margin: 0, lineHeight: 1.4 }}>{almoco.nome}</p>
                {almoco.descricao && <p style={{ fontSize: "0.875rem", color: "var(--muted)", margin: "0.5rem 0 0", lineHeight: 1.55 }}>{almoco.descricao}</p>}
              </div>
            )}
            {sobremesa?.nome && (
              <div style={{ background: "var(--cream-3)", borderRadius: "1rem", padding: "1.25rem" }}>
                <div style={{ fontSize: "0.6875rem", textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--muted)", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.375rem" }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 0 0-7.35 16.76C6.23 17.1 9.02 14 12 14s5.77 3.1 7.35 4.76A10 10 0 0 0 12 2Z"/><path d="M12 14a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"/></svg>
                  Momento Doce
                </div>
                <p style={{ fontSize: "1.0625rem", fontWeight: 600, color: "var(--ink)", margin: 0, lineHeight: 1.4 }}>{sobremesa.nome}</p>
                {sobremesa.descricao && <p style={{ fontSize: "0.875rem", color: "var(--muted)", margin: "0.5rem 0 0", lineHeight: 1.55 }}>{sobremesa.descricao}</p>}
                {sobremesa.foto && (
                  <div style={{ marginTop: "0.875rem", borderRadius: "0.75rem", overflow: "hidden" }}>
                    <img src={apiUrl(sobremesa.foto)} alt={sobremesa.nome} className="w-full aspect-[16/9] object-cover" />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </DayModal>
  );
}

function EstadoVazioMenu({ week }: { week: Week | null }) {
  const dias = week?.dias ?? [];
  const [selected, setSelected] = useState<Day | null>(null);

  return (
    <>
      <div style={{ marginTop: "3rem", ...cardStyle, padding: "2rem 2.5rem" }}>
        <div className="text-center" style={{ maxWidth: "32rem", margin: "0 auto 2rem" }}>
          <h3 style={{ fontFamily: "var(--serif)", fontSize: "1.5rem", color: "var(--brown-dark)" }}>
            <EditableText contentKey="menu.vazio.titulo" />
          </h3>
          <p style={{ marginTop: "0.75rem", color: "var(--muted)" }}>
            <EditableText contentKey="menu.vazio.subtitulo" />
          </p>
        </div>
        <DayCarousel>
          {dias.map((dia) => (
            <DiaCard key={dia.diaSemana} dia={dia} onClick={() => setSelected(dia)} />
          ))}
        </DayCarousel>
      </div>
      <DiaModal dia={selected} open={!!selected} onClose={() => setSelected(null)} />
    </>
  );
}

export function MenuSemana({ week }: MenuSemanaProps) {
  const vazio = !week || week.estado === "oculto";
  const [selected, setSelected] = useState<Day | null>(null);

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
              <em style={{ color: "var(--brown-dark)" }}>
                <EditableText contentKey="menu.title.em" />
              </em>
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

        {vazio ? (
          <EstadoVazioMenu week={week} />
        ) : (
          <>
            <div style={{ marginTop: "3rem", ...cardStyle, padding: "1.5rem" }}>
              <DayCarousel>
                {week.dias.map((dia) => (
                  <DiaCard key={dia.diaSemana} dia={dia} onClick={() => setSelected(dia)} />
                ))}
              </DayCarousel>
            </div>
            <DiaModal dia={selected} open={!!selected} onClose={() => setSelected(null)} />
          </>
        )}
      </div>
    </section>
  );
}
