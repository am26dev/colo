import { cn } from "../../lib/utils";
import { type HTMLAttributes } from "react";

const variants = {
  default: "border-transparent bg-[var(--primary)] text-[var(--primary-foreground)] shadow",
  secondary: "border-transparent bg-[var(--secondary)] text-[var(--secondary-foreground)]",
  destructive: "border-transparent bg-[var(--destructive)] text-[var(--destructive-foreground)] shadow",
  outline: "text-[var(--foreground)]",
  sage: "border-transparent bg-[#7d9178]/20 text-[#41603a]",
  rose: "border-transparent bg-[#c98b82]/20 text-[#b87268]",
};

export interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: keyof typeof variants;
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-2",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
