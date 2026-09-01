import { Reveal } from "../ui/Reveal";
import { EditableText } from "../../edit-mode/EditableText";
import { useEditMode } from "../../edit-mode/EditModeProvider";

export function NotaColo({ mensagem }: { mensagem: string }) {
  const { isEditing, isAdmin, get } = useEditMode();
  const editValue = get("nota.mensagem");
  const displayText = editValue || mensagem;

  if (!displayText.trim()) return null;

  return (
    <section className="section nota">
      <div className="container">
        <Reveal as="figure" className="note-card">
          <blockquote>
            {isEditing && isAdmin ? (
              <EditableText contentKey="nota.mensagem" as="span" multiline />
            ) : (
              displayText
            )}
          </blockquote>
          <figcaption>
            Com carinho,{" "}
            <span className="brand-word sm" style={{ fontFamily: "var(--script)" }}>
              Colo
              <span className="brand-dot"></span>
            </span>
          </figcaption>
        </Reveal>
      </div>
    </section>
  );
}
