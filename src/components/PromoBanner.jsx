// src/components/PromoBanner.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import banner1 from "../assets/banner.png";
import banner2 from "../assets/banner2.png";
import banner3 from "../assets/banner3.png";
import "../styles/PromoBanner.css";

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
  const hideTimerRef = useRef(null);

  // Estado para mostrar / ocultar dots (como Apple TV)
  const [showDots, setShowDots] = useState(true);

  const next = () => setI((p) => (p + 1) % IMGS.length);
  const prev = () => setI((p) => (p - 1 + IMGS.length) % IMGS.length);

  /* ------------------- AUTOPLAY ------------------- */
  useEffect(() => {
    if (!autoplay) return;

    const start = () => {
      clearInterval(timerRef.current);
      timerRef.current = setInterval(next, interval);
    };

    start();

    const onVis = () =>
      document.hidden ? clearInterval(timerRef.current) : start();

    document.addEventListener("visibilitychange", onVis);

    return () => {
      clearInterval(timerRef.current);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [autoplay, interval]);

  /* ------------------- TECLAS ← → ------------------- */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* ------------------- PRELOAD SIGUIENTES SLIDES ------------------- */
  useEffect(() => {
    new Image().src = IMGS[(i + 1) % IMGS.length];
    new Image().src = IMGS[(i - 1 + IMGS.length) % IMGS.length];
  }, [i, IMGS]);

  /* ------------------- MOSTRAR/OCULTAR DOTS (Apple TV) ------------------- */
  const handleUserActivity = () => {
    setShowDots(true);
    clearTimeout(hideTimerRef.current);

    hideTimerRef.current = setTimeout(() => {
      setShowDots(false);
    }, 1500); // 1.5s sin actividad → se ocultan
  };

  useEffect(() => {
    window.addEventListener("mousemove", handleUserActivity);
    window.addEventListener("touchstart", handleUserActivity);

    return () => {
      window.removeEventListener("mousemove", handleUserActivity);
      window.removeEventListener("touchstart", handleUserActivity);
    };
  }, []);

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Promos Hello-Comfy"
      className={`promoBanner ${fullBleed ? "fullBleed" : ""}`}
      style={{ height, borderRadius: fullBleed ? 0 : radius }}
    >
      {/* Slides */}
      {IMGS.map((src, idx) => {
        const active = idx === i;
        const objPos = objectPositions[idx] ?? "center";

        return (
          <img
            key={idx}
            src={src}
            alt=""
            draggable={false}
            className="promoBanner__slide"
            style={{
              opacity: active ? 1 : 0,
              transform: active ? "scale(1)" : "scale(1.02)",
              objectPosition: objPos,
            }}
            loading={active ? "eager" : "lazy"}
          />
        );
      })}

      {/* DOTS ESTILO APPLE TV */}
      <div className={`promoBanner__dots ${showDots ? "visible" : ""}`}>
        {IMGS.map((_, idx) => (
          <button
            key={idx}
            className={`promoBanner__dot ${i === idx ? "active" : ""}`}
            onClick={() => setI(idx)}
            aria-label={`Ir al slide ${idx + 1}`}
          />
        ))}
      </div>

      {/* A11Y */}
      <span className="promoBanner__a11yText">
        Slide {i + 1} de {IMGS.length}
      </span>
    </section>
  );
}
