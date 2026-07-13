import { useRef, useState } from "react";
import { useEditMode } from "./EditModeProvider";
import { getToken } from "../lib/api";
import { compressImage } from "../lib/image";

type EditableImageProps = {
  contentKey: string;
  altKey?: string;
  className?: string;
  width?: number;
  height?: number;
  loading?: "lazy" | "eager";
  wrapperClassName?: string;
};

export function EditableImage({
  contentKey,
  altKey,
  className,
  width,
  height,
  loading = "lazy",
  wrapperClassName,
}: EditableImageProps) {
  const { get, setPending, isEditing, isAdmin } = useEditMode();
  const src = get(contentKey);
  const alt = altKey ? get(altKey) : "";
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const onPick = async (file: File) => {
    setUploading(true);
    try {
      const token = getToken();
      if (!token) throw new Error("Sessão expirada");
      const smaller = await compressImage(file);
      const form = new FormData();
      form.append("foto", smaller);
      const res = await fetch(`/api/edit-content/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.erro ?? "Falha no upload");
      setPending(contentKey, data.url);
    } catch (e: any) {
      alert(`Erro: ${e?.message ?? "Falha no upload"}`);
    } finally {
      setUploading(false);
    }
  };

  const img = (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading={loading}
      className={className}
    />
  );

  if (!isEditing || !isAdmin) return img;

  return (
    <div className={`relative group ${wrapperClassName ?? ""}`}>
      {img}
      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100 transition"
      >
        <span className="inline-flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-sm font-medium text-gray-800">
          {uploading ? "A carregar..." : "Trocar imagem"}
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void onPick(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}
