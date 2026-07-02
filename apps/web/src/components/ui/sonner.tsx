import { cn } from "../../lib/utils";
import { useEffect, useState } from "react";

interface ToasterToast {
  id: string;
  message: string;
  type: "ok" | "erro";
}

let toastListeners: ((toast: ToasterToast) => void)[] = [];

export function toast(message: string, type: "ok" | "erro" = "ok") {
  const id = Math.random().toString(36).slice(2);
  toastListeners.forEach((fn) => fn({ id, message, type }));
  setTimeout(() => {
    toastListeners.forEach((fn) => fn({ id, message: "", type: "ok" }));
  }, 4000);
}

function Toaster() {
  const [toasts, setToasts] = useState<ToasterToast[]>([]);

  useEffect(() => {
    const listener = (t: ToasterToast) => {
      if (!t.message) {
        setToasts((prev) => prev.filter((p) => p.id !== t.id));
      } else {
        setToasts((prev) => [...prev, t]);
        setTimeout(() => {
          setToasts((prev) => prev.filter((p) => p.id !== t.id));
        }, 4000);
      }
    };
    toastListeners.push(listener);
    return () => {
      toastListeners = toastListeners.filter((l) => l !== listener);
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "rounded-xl border px-4 py-3 text-sm font-medium shadow-lg animate-in slide-in-from-right-2",
            t.type === "ok"
              ? "bg-[#7d9178]/20 text-[#41603a] border-[#7d9178]/50"
              : "bg-[#b87268]/20 text-[#8a3a2e] border-[#b87268]/50"
          )}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}

export { Toaster };
