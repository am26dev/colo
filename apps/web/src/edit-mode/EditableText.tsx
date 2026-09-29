import type { ElementType } from "react";
import { useEditMode } from "./EditModeProvider";

type EditableTextProps = {
  contentKey: string;
  as?: ElementType;
  className?: string;
  multiline?: boolean;
  /** Mostrado enquanto a chave estiver vazia. Só serve de omissão: o valor
   *  só é gravado quando a cliente escreve, senão apagar a chave e voltar ao
   *  conteúdo guardado apagava o que não se vê. */
  fallback?: string;
};

export function EditableText({
  contentKey,
  as: Tag = "span",
  className,
  multiline = false,
  fallback,
}: EditableTextProps) {
  const { get, setPending, isEditing, isAdmin } = useEditMode();
  const guardada = get(contentKey);
  const value = guardada.trim() === "" && fallback ? fallback : guardada;

  if (!isEditing || !isAdmin) {
    if (multiline) {
      return (
        <Tag className={className}>
          {value.split("\n").map((line, i, arr) => (
            <span key={i}>
              {line}
              {i < arr.length - 1 && <br />}
            </span>
          ))}
        </Tag>
      );
    }
    return <Tag className={className}>{value}</Tag>;
  }

  return (
    <Tag
      className={`${className ?? ""} outline-none ring-1 ring-dashed ring-[var(--rose)]/60 rounded px-1 -mx-1 hover:ring-[var(--rose)] focus:ring-2 focus:ring-[var(--rose)] transition`}
      contentEditable
      suppressContentEditableWarning
      data-editable-key={contentKey}
      onInput={(e: React.FormEvent<HTMLElement>) => {
        const next = multiline
          ? (e.currentTarget.innerText ?? "")
          : (e.currentTarget.textContent ?? "");
        // Mantém o marcador sincronizado para o ref não reescrever o conteúdo
        // e deslocar o cursor durante a digitação.
        e.currentTarget.setAttribute("data-init", next);
        setPending(contentKey, next);
      }}
      ref={(node: HTMLElement | null) => {
        if (node && node.getAttribute("data-init") !== value) {
          node.textContent = value;
          node.setAttribute("data-init", value);
        }
      }}
    />
  );
}
