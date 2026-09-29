import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
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
import { PainelHeader } from "../../components/gestao/PainelHeader";
import { Ajuda, Dica } from "../../components/gestao/Ajuda";
import { EstadoErro } from "../../components/gestao/EstadoErro";

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
  const [erroCarga, setErroCarga] = useState("");

  const carregar = useCallback(async () => {
    if (!id) return;
    setErroCarga("");
    setCarregando(true);
    try {
      const d = await api<{ week: Week }>(`/api/weeks/${id}`);
      const w = d.week;
      setDataInicio(toDateInput(w.dataInicio));
      setDataFim(toDateInput(w.dataFim));
      setPrecoSemanal(w.precoSemanal);
      setEstado(w.estado);
      setVagasTotais(w.vagasTotais);
      setVagasRestantes(w.vagasRestantes);
      setDias(w.dias.map(toDiaForm));
    } catch (e) {
      setErroCarga(e instanceof Error ? e.message : "Não foi possível carregar esta semana.");
    } finally {
      setCarregando(false);
    }
  }, [id]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

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

  /** Devolve a primeira coisa que está errada, ou null se estiver tudo bem. */
  function validar(): string | null {
    if (!dataInicio || !dataFim) return "Define a data de início e de fim da semana.";
    if (dataFim < dataInicio) return "A data de fim não pode ser anterior à data de início.";
    if (!Number.isFinite(precoSemanal) || precoSemanal < 0) return "O preço não pode ser negativo.";
    if (!Number.isFinite(vagasTotais) || vagasTotais < 0) return "As vagas totais não podem ser negativas.";
    if (!Number.isFinite(vagasRestantes) || vagasRestantes < 0) return "As vagas restantes não podem ser negativas.";
    if (vagasRestantes > vagasTotais) {
      return `Há mais vagas restantes (${vagasRestantes}) do que vagas totais (${vagasTotais}). Corrige um dos números.`;
    }
    if (estado === "aberto" && vagasTotais === 0) {
      return "Uma semana aberta com 0 vagas não aceita nenhum pedido. Define as vagas ou deixa a semana fechada.";
    }
    if (dias.some((d) => d.refeicoes.almoco.nome.trim() === "")) {
      return "Preenche o nome do almoço nos 5 dias antes de guardar.";
    }
    return null;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro("");
    const problema = validar();
    if (problema) {
      setErro(problema);
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
      <>
        <PainelHeader titulo="Editar semana" descricao="A carregar..." />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-[var(--primary)]/5" />
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      <PainelHeader
        titulo={editando ? "Editar semana" : "Nova semana"}
        descricao="Define o intervalo de datas, o preço e as refeições dos 5 dias. Ao guardar, o site passa a mostrar estes menus imediatamente."
        voltar={{ para: "/gestao/semanas", label: "Voltar a semanas" }}
      />

      {erroCarga ? (
        <EstadoErro
          titulo="Não foi possível abrir esta semana"
          mensagem={`${erroCarga} Se o problema continuar, volta à lista de semanas.`}
          aoTentar={carregar}
        />
      ) : (
        <>
          <Ajuda
            titulo="O que este formulário faz — e o que não faz"
            itens={
              <>
                <li><strong>Datas</strong> — delimitam a semana. Em modo automático, esta semana só é a que o site vende quando hoje estiver dentro destas datas; caso contrário o site mostra a mais recente como encerrada.</li>
                <li><strong>Preço e vagas</strong> — o valor que a cliente vê e o número de lugares que o site pode vender.</li>
                <li><strong>Estado</strong> — <em>Aberto</em> aceita reservas, <em>Encerrado</em> mantém o menu visível sem aceitar reservas, <em>Oculto</em> tira a semana do site.</li>
                <li><strong>Os 5 dias</strong> — o menu é sempre de segunda a sexta. Preenche o almoço de cada dia; a sobremesa e a foto são opcionais.</li>
                <li><strong>Não faz</strong> — não avisa a cliente por WhatsApp ou email, não activa a semana e não altera os textos do site. Para textos, usa <em>Editar site</em>; para activar a semana, volta a <em>Semanas</em>.</li>
              </>
            }
            variante={estado === "oculto" ? "aviso" : "info"}
          >
            {estado === "oculto" ? (
              <strong>Vais guardar esta semana como oculta: ela deixa de aparecer no site enquanto não a abrires.</strong>
            ) : null}
          </Ajuda>

          {erro && (
            <div className="mb-4 rounded-lg border border-[var(--destructive)]/30 bg-[var(--destructive)]/10 px-4 py-2 text-sm text-[var(--destructive)]">
              {erro}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <Card className="mb-4">
              <CardContent className="space-y-4 p-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="data-inicio">Data de início</Label>
                    <Input id="data-inicio" type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} required />
                    <Dica>Primeiro dia em que a semana está à venda.</Dica>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="data-fim">Data de fim</Label>
                    <Input id="data-fim" type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} required />
                    <Dica>Último dia. Passada esta data, a semana deixa de ser a que o site vende em modo automático.</Dica>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="preco">Preço da semana (Kz)</Label>
                    <Input id="preco" type="number" min={0} value={precoSemanal} onChange={(e) => setPrecoSemanal(Number(e.target.value))} />
                    <Dica>É este valor que a cliente vê no site. O que a cliente paga depois é um assunto teu, no WhatsApp.</Dica>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="estado">Estado</Label>
                    <Select id="estado" value={estado} onChange={(e) => setEstado(e.target.value as MenuEstado)}>
                      <option value="aberto">Aberto — aceita reservas</option>
                      <option value="fechado">Encerrado — visível, sem reservas</option>
                      <option value="oculto">Oculto — esconder do site</option>
                    </Select>
                    <Dica>Podes mudar o estado a qualquer momento, sem entrar aqui.</Dica>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="vagas-totais">Vagas totais</Label>
                    <Input id="vagas-totais" type="number" min={0} value={vagasTotais} onChange={(e) => setVagasTotais(Number(e.target.value))} />
                    <Dica>Quantas pessoas esta semana pode servir, no total.</Dica>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vagas-restantes">Vagas restantes</Label>
                    <Input id="vagas-restantes" type="number" min={0} value={vagasRestantes} onChange={(e) => setVagasRestantes(Number(e.target.value))} />
                    <Dica>
                      Este número desce sozinho cada vez que confirmas um pedido e volta a subir se o cancelares.
                      Só o muda à mão para corrigir um erro: se o puseres a mais, o site pode aceitar reservas a mais do que lugares.
                    </Dica>
                  </div>
                </div>
                {vagasTotais > 0 && vagasRestantes < vagasTotais && (
                  <Dica>
                    Fica definido que {vagasTotais - vagasRestantes} de {vagasTotais} lugares já estão vendidos.
                  </Dica>
                )}
              </CardContent>
            </Card>

            <Accordion defaultValue="1">
              {dias.map((dia) => {
                const key = String(dia.diaSemana);
                return (
                  <AccordionItem value={key} key={key}>
                    <AccordionTrigger value={key} className="px-4 py-3">
                      <span className="font-medium">{diasSemanaLabels[dia.diaSemana]}</span>
                      {!dia.refeicoes.almoco.nome.trim() && (
                        <span className="ml-2 text-xs font-normal text-[var(--destructive)]">sem almoço</span>
                      )}
                    </AccordionTrigger>
                    <AccordionContent value={key}>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor={`tema-${key}`}>Tema do dia</Label>
                          <Input
                            id={`tema-${key}`}
                            value={dia.tema}
                            onChange={(e) => updateDia(dia.diaSemana, { tema: e.target.value })}
                            placeholder="ex.: Leveza & Frescura"
                          />
                          <Dica>A etiqueta curta que aparece na imagem do dia.</Dica>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`frase-${key}`}>Frase do dia</Label>
                          <Input
                            id={`frase-${key}`}
                            value={dia.frase}
                            onChange={(e) => updateDia(dia.diaSemana, { frase: e.target.value })}
                            placeholder="Uma frase de carinho para este dia"
                          />
                          <Dica>A frase pequena por baixo do tema. Pode ficar vazia.</Dica>
                        </div>

                        <Separator />

                        {refeicaoOrdem.map((tipo) => (
                          <div key={tipo} className="space-y-2 rounded-lg border border-[var(--border)] bg-[var(--secondary)]/30 p-3">
                            <strong className="text-xs uppercase tracking-wider text-[var(--muted-foreground)]">
                              {refeicaoLabels[tipo]}
                            </strong>
                            <div className="space-y-2">
                              <Label htmlFor={`nome-${key}-${tipo}`} className="sr-only">Nome do prato</Label>
                              <Input
                                id={`nome-${key}-${tipo}`}
                                value={dia.refeicoes[tipo].nome}
                                onChange={(e) => updateRefeicao(dia.diaSemana, tipo, { nome: e.target.value })}
                                placeholder="Nome do prato"
                              />
                              <Label htmlFor={`desc-${key}-${tipo}`} className="sr-only">Descrição</Label>
                              <Textarea
                                id={`desc-${key}-${tipo}`}
                                value={dia.refeicoes[tipo].descricao}
                                onChange={(e) => updateRefeicao(dia.diaSemana, tipo, { descricao: e.target.value })}
                                placeholder="Descrição breve"
                              />
                              <ImageUploadField
                                value={dia.refeicoes[tipo].foto}
                                onChange={(url) => updateRefeicao(dia.diaSemana, tipo, { foto: url })}
                              />
                            </div>
                            {tipo === "almoco" && !dia.refeicoes.almoco.nome.trim() && (
                              <Dica>Este é o único campo obrigatório de cada dia.</Dica>
                            )}
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button type="submit" disabled={salvando}>
                {salvando ? "A guardar…" : "Guardar semana"}
              </Button>
              <Button asChild type="button" variant="ghost">
                <Link to="/gestao/semanas">Cancelar</Link>
              </Button>
              <Dica>
                {editando
                  ? "Guardar substitui os 5 dias da semana e limpa a marca de fecho por esgotamento — depois disto, um cancelamento já não reabre a semana sozinha."
                  : "Depois de guardar, a semana fica criada. Para o site a mostrar, activa-a na página Semanas."}
              </Dica>
            </div>
          </form>
        </>
      )}
    </>
  );
}
