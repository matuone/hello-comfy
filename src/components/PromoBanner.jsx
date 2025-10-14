// src/components/PromoBanner.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import banner1 from "../assets/banner.png";
import banner2 from "../assets/banner2.png";
import banner3 from "../assets/banner3.png";

export default function PromoBanner({
  height = "clamp(520px, 72vw, 880px)",
  autoplay = true,
  interval = 5000,
  fullBleed = true,
  radius = 12,
  objectPositions = ["center 35%", "center top", "center 35%"],
}) {
  const IMGS = useMemo(() => [banner1, banner2, banner3], []);
  const [i, setI] = useState(0);
  const timerRef = useRef(null);

  const next = () => setI((p) => (p + 1) % IMGS.length);
  const prev = () => setI((p) => (p - 1 + IMGS.length) % IMGS.length);

  useEffect(() => {
    if (!autoplay) return;
    const start = () => {
      clearInterval(timerRef.current);
      timerRef.current = setInterval(next, interval);
    };
    start();
    const onVis = () => (document.hidden ? clearInterval(timerRef.current) : start());
    document.addEventListener("visibilitychange", onVis);
    return () => {
      clearInterval(timerRef.current);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [autoplay, interval]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const a = new Image(); a.src = IMGS[(i + 1) % IMGS.length];
    const b = new Image(); b.src = IMGS[(i - 1 + IMGS.length) % IMGS.length];
  }, [i, IMGS]);

  const wrapBase = {
    position: "relative",
    width: "100%",
    height,
    overflow: "hidden",
    background: "#f3f3f3",
    borderRadius: fullBleed ? 0 : radius,
  };

  const fullBleedStyles = fullBleed
    ? { width: "100vw", marginLeft: "calc(50% - 50vw)", marginRight: "calc(50% - 50vw)" }
    : {};

  const slide = {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transition: "opacity 400ms ease, transform 400ms ease",
    willChange: "opacity, transform",
  };

  const arrowBase = {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    width: 44,
    height: 44,
    borderRadius: 999,
    border: "1px solid rgba(0,0,0,.15)",
    background: "rgba(255,255,255,.92)",
    display: "grid",
    placeItems: "center",
    cursor: "pointer",
    userSelect: "none",
    zIndex: 5,
    boxShadow: "0 2px 10px rgba(0,0,0,.08)",
  };
  const glyph = { fontSize: 26, lineHeight: 1, marginTop: -2 };

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Promos Hello-Comfy"
      style={{ ...wrapBase, ...fullBleedStyles }}
    >
      {IMGS.map((src, idx) => {
        const active = idx === i;
        const objPos = objectPositions[idx] ?? "center";
        return (
          <img
            key={idx}
            src={src}
            alt=""
            draggable={false}
            style={{
              ...slide,
              objectPosition: objPos,
              opacity: active ? 1 : 0,
              transform: active ? "scale(1)" : "scale(1.02)",
            }}
            loading={active ? "eager" : "lazy"}
          />
        );
      })}

      <button aria-label="Anterior" onClick={prev} style={{ ...arrowBase, left: 16 }}>
        <span style={glyph}>‹</span>
      </button>
      <button aria-label="Siguiente" onClick={next} style={{ ...arrowBase, right: 16 }}>
        <span style={glyph}>›</span>
      </button>

      <span
        style={{
          position: "absolute",
          width: 1,
          height: 1,
          overflow: "hidden",
          clip: "rect(0 0 0 0)",
          whiteSpace: "nowrap",
        }}
      >
        Slide {i + 1} de {IMGS.length}
      </span>
    </section>
  );
}
