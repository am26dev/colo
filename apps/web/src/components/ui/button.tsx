import { cn } from "../../lib/utils";
import { cloneElement, forwardRef, isValidElement, type ButtonHTMLAttributes, type ReactElement, type ReactNode } from "react";

const variants = {
  default:
    "bg-[var(--primary)] text-[var(--primary-foreground)] shadow hover:bg-[var(--primary)]/90",
  destructive:
    "bg-[var(--destructive)] text-[var(--destructive-foreground)] shadow-sm hover:bg-[var(--destructive)]/90",
  outline:
    "border border-[var(--border)] bg-[var(--card)] shadow-sm hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]",
  secondary:
    "bg-[var(--secondary)] text-[var(--secondary-foreground)] shadow-sm hover:bg-[var(--secondary)]/80",
  ghost:
    "hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]",
  link: "text-[var(--primary)] underline-offset-4 hover:underline",
};

const sizes = {
  default: "h-9 px-4 py-2",
  sm: "h-8 rounded-md px-3 text-xs",
  lg: "h-10 rounded-md px-8",
  icon: "h-9 w-9",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  asChild?: boolean;
  children?: ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild, children, ...props }, ref) => {
    const classes = cn(
      "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--ring)] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
      variants[variant],
      sizes[size],
      className
    );

    if (asChild && isValidElement(children)) {
      return cloneElement(children as ReactElement<{ className?: string }>, {
        className: cn(classes, (children as ReactElement<{ className?: string }>).props.className),
      });
    }

    return (
      <button className={classes} ref={ref} {...props}>
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button };
