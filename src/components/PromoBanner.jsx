// src/components/PromoBanner.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import banner1 from "../assets/banner.png";
import banner2 from "../assets/banner2.png";
import banner3 from "../assets/banner3.png";
import "../styles/promobanner.css";

export default function PromoBanner(props) {
  const IMGS = useMemo(function () {
    return [banner1, banner2, banner3];
  }, []);

  const [i, setI] = useState(0);
  const timerRef = useRef(null);
  const hideTimerRef = useRef(null);

  const [showDots, setShowDots] = useState(true);

  function next() {
    setI(function (p) {
      return (p + 1) % IMGS.length;
    });
  }

  function prev() {
    setI(function (p) {
      return (p - 1 + IMGS.length) % IMGS.length;
    });
  }

  /* ------------------- AUTOPLAY ------------------- */
  useEffect(function () {
    if (!props.autoplay) return;

    function start() {
      clearInterval(timerRef.current);
      timerRef.current = setInterval(next, props.interval || 5000);
    }

    start();

    function onVis() {
      if (document.hidden) {
        clearInterval(timerRef.current);
      } else {
        start();
      }
    }

    document.addEventListener("visibilitychange", onVis);

    return function cleanup() {
      clearInterval(timerRef.current);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [props.autoplay, props.interval]);

  /* ------------------- TECLAS ← → ------------------- */
  useEffect(function () {
    function onKey(e) {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    }
    window.addEventListener("keydown", onKey);
    return function cleanup() {
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  /* ------------------- PRELOAD SIGUIENTES SLIDES ------------------- */
  useEffect(function () {
    new Image().src = IMGS[(i + 1) % IMGS.length];
    new Image().src = IMGS[(i - 1 + IMGS.length) % IMGS.length];
  }, [i, IMGS]);

  /* ------------------- MOSTRAR/OCULTAR DOTS ------------------- */
  function handleUserActivity() {
    setShowDots(true);
    clearTimeout(hideTimerRef.current);

    hideTimerRef.current = setTimeout(function () {
      setShowDots(false);
    }, 1500);
  }

  useEffect(function () {
    window.addEventListener("mousemove", handleUserActivity);
    window.addEventListener("touchstart", handleUserActivity);

    return function cleanup() {
      window.removeEventListener("mousemove", handleUserActivity);
      window.removeEventListener("touchstart", handleUserActivity);
    };
  }, []);

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Promos Hello-Comfy"
      className={`promoBanner ${props.fullBleed ? "fullBleed" : ""}`}
    >
      {/* Slides */}
      {IMGS.map(function (src, idx) {
        const active = idx === i;
        const objPos = props.objectPositions
          ? props.objectPositions[idx]
          : "center";

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

      {/* DOTS */}
      <div className={`promoBanner__dots ${showDots ? "visible" : ""}`}>
        {IMGS.map(function (_, idx) {
          return (
            <button
              key={idx}
              className={`promoBanner__dot ${i === idx ? "active" : ""}`}
              onClick={function () {
                setI(idx);
              }}
              aria-label={`Ir al slide ${idx + 1}`}
            />
          );
        })}
      </div>

      {/* A11Y */}
      <span className="promoBanner__a11yText">
        Slide {i + 1} de {IMGS.length}
      </span>
    </section>
  );
}

PromoBanner.defaultProps = {
  autoplay: true,
  interval: 5000,
  fullBleed: true,
  radius: 12,
  objectPositions: ["center 35%", "center top", "center 35%"],
};
