// src/components/PromoBanner.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import banner1 from "../assets/banner.png";
import banner2 from "../assets/banner2.png";
import banner3 from "../assets/banner3.png";
import "../styles/promobanner.css";
import MarketingMessage from "./MarketingMessage";
import { VITE_API_URL } from "../config/index.js";

const API_URL = VITE_API_URL || "http://localhost:5000/api";

export default function PromoBanner(props) {
  const [bannerData, setBannerData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Imágenes por defecto (fallback)
  const defaultIMGS = useMemo(function () {
    return [banner1, banner2, banner3];
  }, []);

  // Cargar configuración del banner desde el backend
  useEffect(() => {
    fetch(`${API_URL}/promo-banner`)
      .then(res => res.json())
      .then(data => {
        setBannerData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error cargando banner:', err);
        setLoading(false);
      });
  }, [API_URL]);

  // Usar imágenes del backend o fallback a las por defecto
  const IMGS = useMemo(function () {
    if (bannerData && bannerData.images && bannerData.images.length > 0) {
      return bannerData.images.map(img => img.url);
    }
    return defaultIMGS;
  }, [bannerData, defaultIMGS]);

  const objectPositions = useMemo(function () {
    if (bannerData && bannerData.images && bannerData.images.length > 0) {
      return bannerData.images.map(img => img.objectPosition || 'center center');
    }
    return props.objectPositions || ["center 35%", "center top", "center 35%"];
  }, [bannerData, props.objectPositions]);

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

  // AUTOPLAY
  useEffect(function () {
    const shouldAutoplay = bannerData?.autoplay !== undefined ? bannerData.autoplay : props.autoplay;
    const autoplayInterval = bannerData?.interval || props.interval || 5000;

    if (!shouldAutoplay) return;

    function start() {
      clearInterval(timerRef.current);
      timerRef.current = setInterval(next, autoplayInterval);
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
    return function () {
      clearInterval(timerRef.current);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [bannerData, props.autoplay, props.interval]);

  // TECLAS ← →
  useEffect(function () {
    function onKey(e) {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    }
    window.addEventListener("keydown", onKey);
    return function () {
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  // PRELOAD SIGUIENTES SLIDES
  useEffect(function () {
    new Image().src = IMGS[(i + 1) % IMGS.length];
    new Image().src = IMGS[(i - 1 + IMGS.length) % IMGS.length];
  }, [i, IMGS]);

  // MOSTRAR/OCULTAR DOTS
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
    return function () {
      window.removeEventListener("mousemove", handleUserActivity);
      window.removeEventListener("touchstart", handleUserActivity);
    };
  }, []);

  // 🔥 Mensaje editable desde admin
  var savedMessage = localStorage.getItem("promoMessage");
  var backendMessage = bannerData?.message;
  var finalMessage = backendMessage || savedMessage || "Aprovechá hoy 3x2 en remeras 🧸";

  if (loading) {
    return null; // O un skeleton loader
  }

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Promos Hello-Comfy"
      className={`promoBanner ${props.fullBleed ? "fullBleed" : ""}`}
    >
      {/* TEXTO SUPERPUESTO */}
      <div className="promoBanner__message">
        <MarketingMessage message={finalMessage} />
      </div>

      {/* Slides */}
      {IMGS.map(function (src, idx) {
        var active = idx === i;
        var objPos = objectPositions[idx] || "center center";

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
