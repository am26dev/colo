import { useState } from "react";
import { api } from "../../lib/api";
import { useEditMode } from "../../edit-mode/EditModeProvider";
import { RODAPE_GRUPOS, RODAPE_ITEMS, chaveVisibilidade } from "../../data/rodape";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";

interface Props {
  onSaved: (msg: string) => void;
  onError: (msg: string) => void;
}

/**
 * Interruptores para ligar/desligar cada contacto e cada link do rodapé.
 * O estado vive no mesmo content store do resto dos textos, por isso a página
 * lê estas flags sem a API precisar de um campo novo na SiteConfig.
 */
export function VisibilidadeRodapeCard({ onSaved, onError }: Props) {
  const { get, refresh } = useEditMode();
  const [visiveis, setVisiveis] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(RODAPE_ITEMS.map((i) => [i.id, get(chaveVisibilidade(i.id)) !== "false"])),
  );
  const [salvando, setSalvando] = useState(false);

  async function guardar() {
    setSalvando(true);
    try {
      await api("/api/edit-content", {
        method: "PUT",
        body: JSON.stringify({
          changes: Object.fromEntries(
            RODAPE_ITEMS.map((i) => [chaveVisibilidade(i.id), visiveis[i.id] ? "true" : "false"]),
          ),
        }),
      });
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
          Liga ou desliga o que aparece no rodapé da página. Desligado aqui é o mesmo que
          não existir para quem visita o site.
        </p>

        <div className="space-y-5">
          {RODAPE_GRUPOS.map((grupo) => (
            <div key={grupo.id} className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-[var(--muted-foreground)]">
                {grupo.titulo}
              </p>
              {RODAPE_ITEMS.filter((i) => i.grupo === grupo.id).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4 py-1.5 border-b border-[var(--border)] last:border-0"
                >
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
              ))}
            </div>
          ))}
        </div>

        <Button className="mt-4" onClick={guardar} disabled={salvando}>
          {salvando ? "A guardar…" : "Guardar visibilidade"}
        </Button>
      </CardContent>
    </Card>
  );
}
