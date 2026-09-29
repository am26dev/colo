import { useState } from "react";
import { api } from "../../lib/api";
import { useEditMode } from "../../edit-mode/EditModeProvider";
import { RODAPE_GRUPOS, RODAPE_ITEMS, chaveVisibilidade } from "../../data/rodape";
import type { SiteConfig } from "../../types";
import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";

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
      onSaved("Contactos e links do rodapé actualizados. ✓");
    } catch (err) {
      onError(err instanceof Error ? err.message : "Erro ao guardar a visibilidade.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Card>
      <CardContent className="p-4">
        <h2 className="text-lg font-semibold mb-1" style={{ fontFamily: "Georgia, serif" }}>
          Contactos e links do rodapé
        </h2>
        <p className="text-sm text-[var(--muted-foreground)] mb-4">
          Edita o link de cada contacto e decide o que aparece no rodapé da página. Desligado
          aqui é o mesmo que não existir para quem visita o site.
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
                return (
                  <div key={item.id} className="space-y-2 py-2 border-b border-[var(--border)] last:border-0">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm">{item.rotulo}</span>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-[var(--muted-foreground)] w-16 text-right">
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
                        <Input
                          value={links[item.id] ?? ""}
                          onChange={(e) => setLinks((s) => ({ ...s, [item.id]: e.target.value }))}
                          placeholder={`Vazio = usa o das Informações do site (${padrao})`}
                        />
                        <p className="text-xs text-[var(--muted-foreground)]">
                          Vazio = usa o contacto definido em «Informações do site».
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        <Button className="mt-4" onClick={guardar} disabled={salvando}>
          {salvando ? "A guardar…" : "Guardar rodapé"}
        </Button>
      </CardContent>
    </Card>
  );
}
