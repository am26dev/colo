import { useState, useRef, type ChangeEvent } from "react";
import { toast } from "../ui/sonner";
import { getToken } from "../../lib/api";

interface Props {
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
}

export function ImageUploadField({ value, onChange, placeholder = "Clique para escolher uma foto" }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast("Apenas imagens são permitidas.", "erro");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast("A imagem é demasiado grande (máx 5 MB).", "erro");
      return;
    }

    setUploading(true);
    try {
      const form = new FormData();
      form.append("foto", file);
      const token = getToken();
      const res = await fetch("/api/uploads", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.erro || "Erro ao enviar imagem.");
      onChange(data.url);
      toast("Foto carregada.", "ok");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Erro ao enviar imagem.", "erro");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function remover() {
    onChange("");
  }

  return (
    <div className="mt-1">
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      {value ? (
        <div className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--card)] p-2">
          <img
            src={value}
            alt="Preview"
            className="h-14 w-14 rounded-md object-cover border border-[var(--border)]"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-[var(--muted-foreground)] truncate">{value.split("/").pop()}</p>
          </div>
          <div className="flex gap-1 shrink-0">
            <button
              type="button"
              className="rounded-md px-2 py-1 text-xs font-medium text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] transition-colors"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? "…" : "Trocar"}
            </button>
            <button
              type="button"
              className="rounded-md px-2 py-1 text-xs font-medium text-[var(--destructive)] hover:bg-[var(--destructive)]/10 transition-colors"
              onClick={remover}
            >
              ✕
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[var(--border)] px-3 py-6 text-sm text-[var(--muted-foreground)] hover:border-[var(--ring)] hover:text-[var(--ring)] transition-colors cursor-pointer"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            "A carregar…"
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              {placeholder}
            </>
          )}
        </button>
      )}
    </div>
  );
}
