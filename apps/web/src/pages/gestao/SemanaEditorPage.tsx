import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../lib/api";
import { diasSemanaLabels, refeicaoLabels, refeicaoOrdem } from "../../data/data";
import type { Day, MenuEstado, Refeicao, TipoRefeicao, Week } from "../../types";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Select } from "../../components/ui/select";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../components/ui/accordion";
import { Separator } from "../../components/ui/separator";
import { ImageUploadField } from "../../components/gestao/ImageUploadField";

interface RefeicaoForm {
  nome: string;
  descricao: string;
  foto: string;
}

interface DiaForm {
  diaSemana: number;
  tema: string;
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
    frase: "",
    refeicoes: {
      almoco: refeicaoVazia(),
      sobremesa: refeicaoVazia(),
    },
  };
}

function toDiaForm(d: Day): DiaForm {
  const form = diaVazio(d.diaSemana);
  form.tema = d.tema;
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
        // icone: d.icone,
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
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 rounded bg-[var(--primary)]/10 animate-pulse" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-24 rounded-xl bg-[var(--primary)]/5 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-1" style={{ fontFamily: "Georgia, serif" }}>
        {editando ? "Editar semana" : "Nova semana"}
      </h1>
      <p className="text-sm text-[var(--muted-foreground)] mb-6">
        Define o intervalo de datas, o preço e as refeições dos 5 dias.
      </p>

      {erro && (
        <div className="rounded-lg bg-[var(--destructive)]/10 border border-[var(--destructive)]/30 px-4 py-2 text-sm text-[var(--destructive)] mb-4">
          {erro}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <Card className="mb-4">
          <CardContent className="p-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data de início</Label>
                <Input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Data de fim</Label>
                <Input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} required />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Preço da semana (Kz)</Label>
                <Input type="number" min={0} value={precoSemanal} onChange={(e) => setPrecoSemanal(Number(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label>Estado</Label>
                <Select value={estado} onChange={(e) => setEstado(e.target.value as MenuEstado)}>
                  <option value="aberto">Aberto — aceita reservas</option>
                  <option value="fechado">Encerrado — visível, sem reservas</option>
                  <option value="oculto">Oculto — esconder do site</option>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Vagas totais</Label>
                <Input type="number" min={0} value={vagasTotais} onChange={(e) => setVagasTotais(Number(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label>Vagas restantes</Label>
                <Input type="number" min={0} value={vagasRestantes} onChange={(e) => setVagasRestantes(Number(e.target.value))} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Accordion defaultValue="1">
          {dias.map((dia) => {
            const key = String(dia.diaSemana);
            return (
              <AccordionItem value={key} key={key}>
                <AccordionTrigger value={key} className="px-4 py-3">
                  <span className="font-medium">{diasSemanaLabels[dia.diaSemana]}</span>
                </AccordionTrigger>
                <AccordionContent value={key}>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Tema do dia</Label>
                      <Input
                        value={dia.tema}
                        onChange={(e) => updateDia(dia.diaSemana, { tema: e.target.value })}
                        placeholder="ex.: Leveza & Frescura"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Frase do dia</Label>
                      <Input
                        value={dia.frase}
                        onChange={(e) => updateDia(dia.diaSemana, { frase: e.target.value })}
                        placeholder="Uma frase de carinho para este dia"
                      />
                    </div>

                    <Separator />

                    {refeicaoOrdem.map((tipo) => (
                      <div key={tipo} className="rounded-lg border border-[var(--border)] p-3 space-y-2 bg-[var(--secondary)]/30">
                        <strong className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider">
                          {refeicaoLabels[tipo]}
                        </strong>
                        <div className="space-y-2">
                          <Input
                            value={dia.refeicoes[tipo].nome}
                            onChange={(e) => updateRefeicao(dia.diaSemana, tipo, { nome: e.target.value })}
                            placeholder="Nome do prato"
                          />
                          <Textarea
                            value={dia.refeicoes[tipo].descricao}
                            onChange={(e) => updateRefeicao(dia.diaSemana, tipo, { descricao: e.target.value })}
                            placeholder="Descrição breve"
                          />
                          <ImageUploadField
                            value={dia.refeicoes[tipo].foto}
                            onChange={(url) => updateRefeicao(dia.diaSemana, tipo, { foto: url })}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>

        <div className="mt-6">
          <Button type="submit" disabled={salvando}>
            {salvando ? "A guardar…" : "Guardar semana"}
          </Button>
        </div>
      </form>
    </div>
  );
}
