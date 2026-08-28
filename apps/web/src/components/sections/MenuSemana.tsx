import { EditableText } from "../../edit-mode/EditableText";
import { EditableImage } from "../../edit-mode/EditableImage";
import type { Week } from "../../types";
import { apiUrl } from "../../lib/api";

interface MenuSemanaProps {
  week: Week | null;
}

const GALERIA_INDEXES = [0, 1, 2, 3, 4];

function EstadoVazioMenu() {
  return (
    <div
      style={{
        marginTop: "3rem",
        borderRadius: "1.5rem",
        border: "1px solid var(--cream-2)",
        background: "rgba(255,255,255,0.6)",
        padding: "2rem 3rem",
      }}
    >
      <div
        className="text-center"
        style={{ maxWidth: "32rem", margin: "0 auto" }}
      >
        <h3
          style={{
            fontFamily: "var(--serif)",
            fontSize: "1.5rem",
            color: "var(--brown-dark)",
          }}
        >
          Estamos a preparar o menu da próxima semana.
        </h3>
        <p style={{ marginTop: "0.75rem", color: "var(--muted)" }}>
          Enquanto preparamos o menu da próxima semana, espreita alguns pratos
          que já fizeram parte da Colo.
        </p>
      </div>
      <div
        style={{
          marginTop: "2rem",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
          gap: "0.75rem",
        }}
      >
        {GALERIA_INDEXES.map((i) => (
          <div key={i} style={{ borderRadius: "1rem", overflow: "hidden" }}>
            <EditableImage
              contentKey={`galeria.${i}.image`}
              altKey={`galeria.${i}.label`}
              width={1024}
              height={1024}
              className="aspect-square w-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export function MenuSemana({ week }: MenuSemanaProps) {
  const vazio = !week || week.estado === "oculto";

  return (
    <section
      id="menu"
      className="section"
      style={{ background: "var(--cream-3)" }}
    >
      <div
        className="container"
        style={{ padding: "clamp(72px, 10vw, 120px) 28px" }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "1.5rem",
          }}
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
          <div
            style={{
              borderRadius: "1rem",
              background: "var(--brown)",
              padding: "1rem 1.5rem",
              color: "var(--cream-3)",
            }}
          >
            <div
              style={{
                fontSize: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.2em",
                opacity: 0.8,
              }}
            >
              <EditableText contentKey="menu.preco.label" />
            </div>
            <div
              style={{
                fontFamily: "var(--sans)",
                fontSize: "1.75rem",
                fontWeight: 600,
              }}
            >
              <EditableText contentKey="menu.preco.valor" />
            </div>
            <div
              style={{
                marginTop: "0.25rem",
                fontSize: "0.6875rem",
                letterSpacing: "0.04em",
                opacity: 0.72,
              }}
            >
              5 dias • almoço + momento doce • entregas diárias
            </div>
          </div>
        </div>

        {vazio ? (
          <EstadoVazioMenu />
        ) : (
          <div
            style={{
              marginTop: "3rem",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: "1.25rem",
            }}
          >
            {week.dias.map((dia) => {
              const almoco = dia.refeicoes.find(
                (refeicao) => refeicao.tipo === "almoco",
              );
              const momentoDoce = dia.refeicoes.find(
                (refeicao) => refeicao.tipo === "sobremesa",
              );
              return (
                <article
                  key={dia.diaSemana}
                  className="soft-card"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                  }}
                >
                  <div style={{ overflow: "hidden" }}>
                    {almoco?.foto ? (
                      <img
                        src={apiUrl(almoco.foto)}
                        alt={almoco.nome}
                        width={1024}
                        height={1024}
                        className="aspect-square w-full object-cover transition-transform duration-500 hover:scale-[1.04]"
                      />
                    ) : (
                      <div
                        className="aspect-square w-full"
                        style={{ background: "var(--cream-2)" }}
                      />
                    )}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flex: 1,
                      flexDirection: "column",
                      padding: "1.25rem",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "baseline",
                        justifyContent: "space-between",
                      }}
                    >
                      <div
                        style={{
                          fontFamily: "var(--serif)",
                          fontSize: "1.25rem",
                          color: "var(--brown-dark)",
                        }}
                      >
                        {dia.diaSemana === 1
                          ? "Segunda-feira"
                          : dia.diaSemana === 2
                            ? "Terça-feira"
                            : dia.diaSemana === 3
                              ? "Quarta-feira"
                              : dia.diaSemana === 4
                                ? "Quinta-feira"
                                : "Sexta-feira"}
                      </div>
                      <div
                        style={{
                          fontSize: "0.6875rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.18em",
                          color: "var(--rose-deep)",
                        }}
                      >
                        {dia.tema}
                      </div>
                    </div>
                    <div
                      style={{
                        marginTop: "1rem",
                        borderTop: "1px solid rgba(238, 223, 208, 0.7)",
                        paddingTop: "1rem",
                        fontSize: "0.9375rem",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "0.6875rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.15em",
                          color: "var(--muted)",
                        }}
                      >
                        Almoço
                      </div>
                      <p
                        style={{
                          marginTop: "0.25rem",
                          lineHeight: 1.4,
                          color: "var(--ink)",
                        }}
                      >
                        {almoco?.nome}
                      </p>
                    </div>
                    <div
                      style={{ marginTop: "0.75rem", fontSize: "0.9375rem" }}
                    >
                      <div
                        style={{
                          fontSize: "0.6875rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.15em",
                          color: "var(--muted)",
                        }}
                      >
                        Momento Doce
                      </div>
                      <p
                        style={{
                          marginTop: "0.25rem",
                          lineHeight: 1.4,
                          color: "var(--ink)",
                        }}
                      >
                        {momentoDoce?.nome}
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
