import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";

interface RevealProps {
  as?: ElementType;
  delay?: 1 | 2 | 3 | 4;
  className?: string;
  children: ReactNode;
  [key: string]: unknown;
}

/** Porta o reveal-on-scroll do app.js original (IntersectionObserver + classe .visible). */
export function Reveal({ as: Tag = "div", delay, className = "", children, ...rest }: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) {
      setVisible(true);
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: "0px 0px -20px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const classes = ["reveal", delay ? `reveal-delay-${delay}` : "", visible ? "visible" : "", className]
    .filter(Boolean)
    .join(" ");

  return (
    <Tag ref={ref} className={classes} {...rest}>
      {children}
    </Tag>
  );
}
