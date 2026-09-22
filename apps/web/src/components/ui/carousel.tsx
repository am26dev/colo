import { useRef, useState, useEffect, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export function DayCarousel({ children }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  function updateArrows() {
    const el = trackRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }

  useEffect(() => {
    updateArrows();
    const el = trackRef.current;
    if (!el) return;
    const ro = new ResizeObserver(updateArrows);
    ro.observe(el);
    el.addEventListener("scroll", updateArrows, { passive: true });
    return () => { ro.disconnect(); el.removeEventListener("scroll", updateArrows); };
  }, []);

  function scroll(dir: -1 | 1) {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>(":scope > *");
    const gap = 20;
    const step = (card?.offsetWidth ?? 260) + gap;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  }

  return (
    <div style={{ position: "relative" }}>
      {canLeft && (
        <button
          type="button"
          onClick={() => scroll(-1)}
          aria-label="Anterior"
          style={{
            position: "absolute",
            left: "-1rem",
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 10,
            width: "2.5rem",
            height: "2.5rem",
            borderRadius: "999px",
            border: "1px solid rgba(238,223,208,0.6)",
            background: "#fff",
            boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--brown)",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--cream-2)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#fff"; }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
      )}
      {canRight && (
        <button
          type="button"
          onClick={() => scroll(1)}
          aria-label="Próximo"
          style={{
            position: "absolute",
            right: "-1rem",
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 10,
            width: "2.5rem",
            height: "2.5rem",
            borderRadius: "999px",
            border: "1px solid rgba(238,223,208,0.6)",
            background: "#fff",
            boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--brown)",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--cream-2)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#fff"; }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </button>
      )}

      <div
        ref={trackRef}
        className="day-carousel-track"
        style={{
          display: "flex",
          gap: "1.25rem",
          overflowX: "auto",
          scrollSnapType: "x mandatory",
          scrollBehavior: "smooth",
          paddingBottom: "0.5rem",
          msOverflowStyle: "none",
          scrollbarWidth: "none",
        }}
      >
        {children}
      </div>

      <style>{`
        .day-carousel-track::-webkit-scrollbar { display: none; }
        .day-carousel-track > * { scroll-snap-align: start; flex: 0 0 260px; }
        @media (min-width: 768px) {
          .day-carousel-track > * { flex: 0 0 calc((100% - 4 * 1.25rem) / 5); }
        }
      `}</style>
    </div>
  );
}
