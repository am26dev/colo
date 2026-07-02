import { cn } from "../../lib/utils";
import { createContext, useContext, useState, type HTMLAttributes, type ReactNode } from "react";

interface AccordionContextValue {
  expanded: string | null;
  setExpanded: (id: string | null) => void;
}

const AccordionContext = createContext<AccordionContextValue | null>(null);

function useAccordion() {
  const ctx = useContext(AccordionContext);
  if (!ctx) throw new Error("Accordion compound components must be used within Accordion");
  return ctx;
}

interface AccordionProps {
  children: ReactNode;
  className?: string;
  defaultValue?: string;
}

function Accordion({ children, className, defaultValue }: AccordionProps) {
  const [expanded, setExpanded] = useState<string | null>(defaultValue ?? null);
  return (
    <AccordionContext.Provider value={{ expanded, setExpanded }}>
      <div className={cn("space-y-2", className)}>{children}</div>
    </AccordionContext.Provider>
  );
}

interface AccordionItemProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
}

function AccordionItem({ className, value, children, ...props }: AccordionItemProps) {
  return (
    <div className={cn("rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-sm", className)} {...props}>
      {children}
    </div>
  );
}

interface AccordionTriggerProps extends HTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  value: string;
}

function AccordionTrigger({ className, children, value, ...props }: AccordionTriggerProps) {
  const { expanded, setExpanded } = useAccordion();
  const isOpen = expanded === value;

  return (
    <button
      type="button"
      className={cn(
        "flex w-full items-center justify-between px-4 py-3 text-sm font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180",
        className
      )}
      data-state={isOpen ? "open" : "closed"}
      onClick={() => setExpanded(isOpen ? null : value)}
      {...props}
    >
      {children}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="shrink-0 transition-transform duration-200"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </button>
  );
}

interface AccordionContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  value: string;
}

function AccordionContent({ className, children, value, ...props }: AccordionContentProps) {
  const { expanded } = useAccordion();
  const isOpen = expanded === value;

  return (
    <div
      data-state={isOpen ? "open" : "closed"}
      className={cn(
        "overflow-hidden text-sm transition-all",
        isOpen ? "max-h-[5000px] pb-4 px-4" : "max-h-0"
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
