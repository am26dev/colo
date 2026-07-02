import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../lib/api";
import { diasSemanaLabels, refeicaoLabels, refeicaoOrdem } from "../../data/data";
import type { Day, MenuEstado, Refeicao, TipoRefeicao, Week } from "../../types";

interface RefeicaoForm {
  nome: string;
  descricao: string;
  foto: string;
}

interface DiaForm {
  diaSemana: number;
  tema: string;
  icone: string;
  frase: string;
  refeicoes: Record<TipoRefeicao, RefeicaoForm>;
}

function refeicaoVazia(): RefeicaoForm {
  return { nome: "", descricao: "", foto: "" };
}

function diaVazio(diaSemana: number): DiaForm {
  return {
    diaSemana,
    tema: "",
    icone: "",
    frase: "",
    refeicoes: {
      "pequeno-almoco": refeicaoVazia(),
      almoco: refeicaoVazia(),
      lanche: refeicaoVazia(),
      jantar: refeicaoVazia(),
    },
  };
}

function toDiaForm(d: Day): DiaForm {
  const form = diaVazio(d.diaSemana);
  form.tema = d.tema;
  form.icone = d.icone;
  form.frase = d.frase;
  for (const r of d.refeicoes) {
    form.refeicoes[r.tipo] = { nome: r.nome, descricao: r.descricao, foto: r.foto };
  }
  return form;
}

function toDateInput(iso: string): string {
  return iso.slice(0, 10);
}

export default function SemanaEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const editando = !!id;

  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [precoSemanal, setPrecoSemanal] = useState(100000);
  const [estado, setEstado] = useState<MenuEstado>("aberto");
  const [vagasTotais, setVagasTotais] = useState(6);
  const [vagasRestantes, setVagasRestantes] = useState(6);
  const [dias, setDias] = useState<DiaForm[]>([1, 2, 3, 4, 5].map(diaVazio));
  const [carregando, setCarregando] = useState(editando);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (!id) return;
    api<{ week: Week }>(`/api/weeks/${id}`).then((d) => {
      const w = d.week;
      setDataInicio(toDateInput(w.dataInicio));
      setDataFim(toDateInput(w.dataFim));
      setPrecoSemanal(w.precoSemanal);
      setEstado(w.estado);
      setVagasTotais(w.vagasTotais);
      setVagasRestantes(w.vagasRestantes);
      setDias(w.dias.map(toDiaForm));
      setCarregando(false);
    });
  }, [id]);

  function updateDia(diaSemana: number, patch: Partial<DiaForm>) {
    setDias((ds) => ds.map((d) => (d.diaSemana === diaSemana ? { ...d, ...patch } : d)));
  }

  function updateRefeicao(diaSemana: number, tipo: TipoRefeicao, patch: Partial<RefeicaoForm>) {
    setDias((ds) =>
      ds.map((d) =>
        d.diaSemana === diaSemana
          ? { ...d, refeicoes: { ...d.refeicoes, [tipo]: { ...d.refeicoes[tipo], ...patch } } }
          : d
      )
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro("");
    if (!dataInicio || !dataFim) {
      setErro("Define a data de início e de fim da semana.");
      return;
    }
    setSalvando(true);
    const payload = {
      dataInicio,
      dataFim,
      precoSemanal,
      estado,
      vagasTotais,
      vagasRestantes,
      dias: dias.map((d) => ({
        diaSemana: d.diaSemana,
        tema: d.tema,
        icone: d.icone,
        frase: d.frase,
        refeicoes: refeicaoOrdem.map((tipo) => ({ tipo, ...d.refeicoes[tipo] })) as Refeicao[],
      })),
    };
    try {
      if (editando) {
        await api(`/api/weeks/${id}`, { method: "PUT", body: JSON.stringify(payload) });
      } else {
        await api("/api/weeks", { method: "POST", body: JSON.stringify(payload) });
      }
      navigate("/gestao/semanas");
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao guardar a semana.");
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) {
    return <p>A carregar…</p>;
  }

  return (
    <div>
      <h1>{editando ? "Editar semana" : "Nova semana"}</h1>
      <p className="sub">Define o intervalo de datas, o preço e as refeições dos 5 dias.</p>

      {erro && <div className="flash erro">{erro}</div>}

      <form onSubmit={handleSubmit}>
        <div className="card">
          <div className="row">
            <div>
              <label>Data de início</label>
              <input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} required />
            </div>
            <div>
              <label>Data de fim</label>
              <input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} required />
            </div>
          </div>
          <div className="row">
            <div>
              <label>Preço da semana (Kz)</label>
              <input
                type="number"
                min={0}
                value={precoSemanal}
                onChange={(e) => setPrecoSemanal(Number(e.target.value))}
              />
            </div>
            <div>
              <label>Estado</label>
              <select value={estado} onChange={(e) => setEstado(e.target.value as MenuEstado)}>
                <option value="aberto">Aberto — aceita reservas</option>
                <option value="fechado">Encerrado — visível, sem reservas</option>
                <option value="oculto">Oculto — esconder do site</option>
              </select>
            </div>
          </div>
          <div className="row">
            <div>
              <label>Vagas totais</label>
              <input type="number" min={0} value={vagasTotais} onChange={(e) => setVagasTotais(Number(e.target.value))} />
            </div>
            <div>
              <label>Vagas restantes</label>
              <input
                type="number"
                min={0}
                value={vagasRestantes}
                onChange={(e) => setVagasRestantes(Number(e.target.value))}
              />
            </div>
          </div>
        </div>

        {dias.map((dia) => (
          <div className="card dia-editor" key={dia.diaSemana}>
            <h2>{diasSemanaLabels[dia.diaSemana]}</h2>
            <div className="row">
              <div>
                <label>Tema do dia</label>
                <input
                  type="text"
                  value={dia.tema}
                  onChange={(e) => updateDia(dia.diaSemana, { tema: e.target.value })}
                  placeholder="ex.: Leveza & Frescura"
                />
              </div>
              <div>
                <label>Ícone (emoji)</label>
                <input
                  type="text"
                  value={dia.icone}
                  onChange={(e) => updateDia(dia.diaSemana, { icone: e.target.value })}
                  placeholder="🌿"
                />
              </div>
            </div>
            <label>Frase do dia</label>
            <input
              type="text"
              value={dia.frase}
              onChange={(e) => updateDia(dia.diaSemana, { frase: e.target.value })}
              placeholder="Uma frase de carinho para este dia"
            />

            {refeicaoOrdem.map((tipo) => (
              <div className="refeicao-editor" key={tipo}>
                <strong className="muted">{refeicaoLabels[tipo]}</strong>
                <input
                  type="text"
                  value={dia.refeicoes[tipo].nome}
                  onChange={(e) => updateRefeicao(dia.diaSemana, tipo, { nome: e.target.value })}
                  placeholder="Nome do prato"
                />
                <textarea
                  value={dia.refeicoes[tipo].descricao}
                  onChange={(e) => updateRefeicao(dia.diaSemana, tipo, { descricao: e.target.value })}
                  placeholder="Descrição breve"
                />
                <input
                  type="text"
                  value={dia.refeicoes[tipo].foto}
                  onChange={(e) => updateRefeicao(dia.diaSemana, tipo, { foto: e.target.value })}
                  placeholder="/assets/img/foto.jpg (opcional)"
                />
              </div>
            ))}
          </div>
        ))}

        <div className="actions">
          <button className="btn" type="submit" disabled={salvando}>
            {salvando ? "A guardar…" : "Guardar semana"}
          </button>
        </div>
      </form>
    </div>
  );
}
