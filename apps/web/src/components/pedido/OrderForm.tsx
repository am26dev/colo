import { useState, type FormEvent } from "react";
import { cicloOpcoes, pedidoSecao } from "../../data/data";
import { Reveal } from "../ui/Reveal";
import { api } from "../../lib/api";
import {
  montarMensagemComprovativo,
  montarMensagemPedido,
  whatsappLink,
} from "../../utils/whatsapp";
import type { Order, SiteConfig, Week } from "../../types";
import { EditableText } from "../../edit-mode/EditableText";
import { useEditMode } from "../../edit-mode/EditModeProvider";

interface OrderFormProps {
  week: Week | null;
  config: SiteConfig;
  aberto: boolean;
}

export function OrderForm({ week, config, aberto }: OrderFormProps) {
  const { get } = useEditMode();
  const [nome, setNome] = useState("");
  const [contacto, setContacto] = useState("");
  const [ciclo, setCiclo] = useState("");
  const [notas, setNotas] = useState("");
  const [erroNome, setErroNome] = useState(false);
  const [erroContacto, setErroContacto] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [confirmado, setConfirmado] = useState(false);

  function campoStyle(temErro: boolean, preenchido: boolean) {
    if (temErro) return { borderColor: "var(--rose-deep)" };
    if (preenchido) return { borderColor: "var(--sage)" };
    return undefined;
  }

  function limparFormulario() {
    setConfirmado(false);
    setNome("");
    setContacto("");
    setCiclo("");
    setNotas("");
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro("");
    if (!nome.trim()) {
      setErroNome(true);
      return;
    }
    if (!contacto.trim()) {
      setErroContacto(true);
      return;
    }

    setEnviando(true);

    // Sem semana aberta: só pede para ser avisada — não fica registado como pedido.
    if (!aberto || !week) {
      window.open(
        whatsappLink(
          config.whatsapp,
          `Olá Colo! 💛 Quero ser avisada quando abrirem os pedidos da próxima semana.\nNome: ${nome}\nContacto: ${contacto}`,
        ),
        "_blank",
      );
      setEnviando(false);
      setConfirmado(true);
      return;
    }

    try {
      await api<{ order: Order }>("/api/orders", {
        method: "POST",
        body: JSON.stringify({ tipo: "semana", nome, contacto, ciclo, notas }),
      });
      window.open(
        whatsappLink(
          config.whatsapp,
          montarMensagemPedido(
            { semana: week, nome, contacto, ciclo, notas },
            config.moeda,
          ),
        ),
        "_blank",
      );
      setConfirmado(true);
    } catch (err) {
      setErro(
        err instanceof Error
          ? err.message
          : "Não foi possível enviar o pedido. Tenta novamente.",
      );
    } finally {
      setEnviando(false);
    }
  }

  function handleComprovativo() {
    window.open(
      whatsappLink(config.whatsapp, montarMensagemComprovativo(nome, week)),
      "_blank",
    );
  }

  if (confirmado) {
    return (
      <Reveal as="div" delay={2} className="pedido-form pedido-confirmado">
        <h3>{pedidoSecao.confirmacao.titulo}</h3>
        <p>{pedidoSecao.confirmacao.texto}</p>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={limparFormulario}
        >
          {pedidoSecao.confirmacao.cta}
        </button>
      </Reveal>
    );
  }

  return (
    <Reveal
      as="form"
      delay={2}
      className="pedido-form"
      noValidate
      onSubmit={handleSubmit}
    >
      {!aberto && (
        <div className="form-closed">
          <EditableText contentKey="form.closed" />
        </div>
      )}
      {erro && <div className="form-closed">{erro}</div>}

      <div className="field">
        <label htmlFor="nome">
          <EditableText contentKey="form.field.nome" />
        </label>
        <input
          type="text"
          id="nome"
          name="nome"
          placeholder={get("form.placeholder.nome")}
          required
          autoComplete="given-name"
          value={nome}
          onChange={(e) => {
            setNome(e.target.value);
            if (e.target.value.trim()) setErroNome(false);
          }}
          onBlur={() => setErroNome(!nome.trim())}
          style={campoStyle(erroNome, !!nome.trim())}
        />
      </div>

      <div className="field">
        <label htmlFor="contacto">
          <EditableText contentKey="form.field.telefone" />
        </label>
        <input
          type="tel"
          id="contacto"
          name="contacto"
          placeholder={get("form.placeholder.telefone")}
          required
          autoComplete="tel"
          value={contacto}
          onChange={(e) => {
            setContacto(e.target.value);
            if (e.target.value.trim()) setErroContacto(false);
          }}
          onBlur={() => setErroContacto(!contacto.trim())}
          style={campoStyle(erroContacto, !!contacto.trim())}
        />
      </div>

      <div className="field">
        <label htmlFor="ciclo">
          <EditableText contentKey="form.field.ciclo" />{" "}
          <span className="opt">
            <EditableText contentKey="form.optional" />
          </span>
        </label>
        <select
          id="ciclo"
          name="ciclo"
          value={ciclo}
          onChange={(e) => setCiclo(e.target.value)}
        >
          {cicloOpcoes.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="notas">
          <EditableText contentKey="form.field.observacoes" />{" "}
          <span className="opt">
            <EditableText contentKey="form.optional" />
          </span>
        </label>
        <textarea
          id="notas"
          name="notas"
          rows={2}
          placeholder={get("form.placeholder.observacoes")}
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
        />
      </div>

      <button
        type="submit"
        className="btn btn-primary btn-block"
        disabled={enviando}
      >
        {enviando ? (
          "A enviar…"
        ) : aberto ? (
          <EditableText contentKey="form.submit" />
        ) : (
          <EditableText contentKey="form.submit.closed" />
        )}
      </button>
      <p className="form-hint">
        <EditableText contentKey="form.submitHint" />
      </p>

      <div className="comprovativo-section">
        <div className="comprovativo-divider">
          <span>
            <EditableText contentKey="form.comprovativo.question" />
          </span>
        </div>
        <button
          type="button"
          className="btn btn-ghost btn-block btn-comprovativo"
          onClick={handleComprovativo}
        >
          <EditableText contentKey="form.comprovativo.label" />
        </button>
        <p className="form-hint">
          <EditableText contentKey="form.comprovativo.hint" />
        </p>
      </div>
    </Reveal>
  );
}
