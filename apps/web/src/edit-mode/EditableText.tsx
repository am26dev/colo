import { useRef, type ElementType } from "react";
import { useEditMode } from "./EditModeProvider";

type EditableTextProps = {
  contentKey: string;
  as?: ElementType;
  className?: string;
  multiline?: boolean;
};

export function EditableText({
  contentKey,
  as: Tag = "span",
  className,
  multiline = false,
}: EditableTextProps) {
  const { get, setPending, isEditing, isAdmin } = useEditMode();
  const value = get(contentKey);

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
      onBlur={(e: React.FocusEvent<HTMLElement>) => {
        const next = multiline
          ? (e.currentTarget.innerText ?? "")
          : (e.currentTarget.textContent ?? "");
        if (next !== value) setPending(contentKey, next);
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
