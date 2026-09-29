import { useState } from "react";
import { api } from "../../lib/api";
import { useEditMode } from "../../edit-mode/EditModeProvider";
import { RODAPE_GRUPOS, RODAPE_ITEMS, chaveVisibilidade } from "../../data/rodape";
import type { SiteConfig } from "../../types";
import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { Dica } from "./Ajuda";

interface Props {
  config: SiteConfig;
  onSaved: (msg: string) => void;
  onError: (msg: string) => void;
}

/**
 * Interruptores para ligar/desligar cada contacto e cada link do rodapé, e
 * edição dos links dos contactos. O estado vive no mesmo content store do
 * resto dos textos, por isso a página lê estas flags sem a API precisar de um
 * campo novo na SiteConfig.
 */
export function VisibilidadeRodapeCard({ config, onSaved, onError }: Props) {
  const { get, refresh } = useEditMode();
  const [visiveis, setVisiveis] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(RODAPE_ITEMS.map((i) => [i.id, get(chaveVisibilidade(i.id)) !== "false"])),
  );
  const [links, setLinks] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      RODAPE_ITEMS.filter((i) => i.contentKeyUrl).map((i) => [i.id, get(i.contentKeyUrl!)]),
    ),
  );
  const [salvando, setSalvando] = useState(false);
  const [guardado, setGuardado] = useState({ visiveis, links });

  /** Só o botão é que guarda: nada muda no site enquanto não carregares nele. */
  const alterado =
    JSON.stringify(visiveis) !== JSON.stringify(guardado.visiveis) ||
    JSON.stringify(links) !== JSON.stringify(guardado.links);

  async function guardar() {
    setSalvando(true);
    try {
      const changes: Record<string, string> = {};
      for (const item of RODAPE_ITEMS) {
        changes[chaveVisibilidade(item.id)] = visiveis[item.id] ? "true" : "false";
        if (item.contentKeyUrl) {
          const valor = (links[item.id] ?? "").trim();
          // Chave vazia = o rodapé usa o contacto das Informações do site.
          changes[item.contentKeyUrl] = valor;
        }
      }
      await api("/api/edit-content", { method: "PUT", body: JSON.stringify({ changes }) });
      await refresh();
      setGuardado({ visiveis: { ...visiveis }, links: { ...links } });
      onSaved("Contactos e links do rodapé actualizados. Já estão no site.");
    } catch (err) {
      onError(err instanceof Error ? err.message : "Erro ao guardar a visibilidade.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Card>
      <CardContent className="p-4">
        <h2 className="mb-1 text-lg font-semibold" style={{ fontFamily: "Georgia, serif" }}>
          Contactos e links do rodapé
        </h2>
        <p className="mb-4 text-sm text-[var(--muted-foreground)]">
          Edita o link de cada contacto e decide o que aparece no rodapé da página. Desligado
          aqui é o mesmo que não existir para quem visita o site — mas podes voltar a ligá-lo
          quando quiseres.
        </p>

        <div className="space-y-5">
          {RODAPE_GRUPOS.map((grupo) => (
            <div key={grupo.id} className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-[var(--muted-foreground)]">
                {grupo.titulo}
              </p>
              {RODAPE_ITEMS.filter((i) => i.grupo === grupo.id).map((item) => {
                const temLink = !!item.contentKeyUrl;
                const padrao = item.urlPadrao?.(config) ?? "";
                const valor = (links[item.id] ?? "").trim();
                return (
                  <div key={item.id} className="space-y-2 border-b border-[var(--border)] py-2 last:border-0">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm">{item.rotulo}</span>
                      <div className="flex shrink-0 items-center gap-2">
                        <span className="w-16 text-right text-xs text-[var(--muted-foreground)]">
                          {visiveis[item.id] ? "Visível" : "Escondido"}
                        </span>
                        <Switch
                          checked={visiveis[item.id]}
                          onCheckedChange={(v) => setVisiveis((s) => ({ ...s, [item.id]: v }))}
                          aria-label={`${visiveis[item.id] ? "Esconder" : "Mostrar"} ${item.rotulo}`}
                        />
                      </div>
                    </div>
                    {temLink && (
                      <div className="space-y-1">
                        <Label htmlFor={`rodape-url-${item.id}`} className="text-xs text-[var(--muted-foreground)]">
                          Link deste contacto
                        </Label>
                        <Input
                          id={`rodape-url-${item.id}`}
                          value={links[item.id] ?? ""}
                          onChange={(e) => setLinks((s) => ({ ...s, [item.id]: e.target.value }))}
                          placeholder={padrao || "https://..."}
                        />
                        <Dica>
                          {valor
                            ? <>Vai usar <strong>{valor}</strong>. Para voltar ao das Informações do site, apaga o campo.</>
                            : <>Vazio: usa o contacto definido em <strong>Informações do site</strong> ({padrao || "sem valor"}).</>}
                        </Dica>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button onClick={guardar} disabled={salvando || !alterado}>
            {salvando ? "A guardar…" : "Guardar rodapé"}
          </Button>
          {alterado && (
            <p className="text-xs text-[var(--muted-foreground)]">
              Tens alterações por guardar — o site ainda está como estava.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
