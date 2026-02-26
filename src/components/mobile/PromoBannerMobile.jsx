
import { useEffect, useMemo, useRef, useState } from "react";
import banner1 from "../../assets/banner.png";
import banner2 from "../../assets/banner2.png";
import banner3 from "../../assets/banner3.png";
import MarketingMessage from "../MarketingMessage";
import "../../styles/promobanner.mobile.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
function apiPath(path) {
  return API_URL.endsWith("/api") ? `${API_URL}${path}` : `${API_URL}/api${path}`;
}

export default function PromoBannerMobile(props) {
  const [bannerData, setBannerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [i, setI] = useState(0);
  const timerRef = useRef(null);
  const hideTimerRef = useRef(null);
  const [showDots, setShowDots] = useState(true);

  // Imágenes por defecto (fallback)
  const defaultIMGS = useMemo(() => [banner1, banner2, banner3], []);

  useEffect(() => {
    fetch(apiPath('/promo-banner'))
      .then(res => res.json())
      .then(data => {
        setBannerData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error cargando banner:', err);
        setLoading(false);
      });
  }, []);

  // Usar imágenes del backend o fallback a las por defecto
  const IMGS = useMemo(() => {
    if (bannerData && bannerData.images && bannerData.images.length > 0) {
      return bannerData.images.map(img => img.url);
    }
    return defaultIMGS;
  }, [bannerData, defaultIMGS]);

  const objectPositions = useMemo(() => {
    if (bannerData && bannerData.images && bannerData.images.length > 0) {
      return bannerData.images.map(img => img.objectPosition || 'center center');
    }
    return ["center 35%", "center top", "center 35%"];
  }, [bannerData]);

  function next() {
    setI(p => (p + 1) % IMGS.length);
  }
  function prev() {
    setI(p => (p - 1 + IMGS.length) % IMGS.length);
  }

  // AUTOPLAY
  useEffect(() => {
    const shouldAutoplay = bannerData?.autoplay !== undefined ? bannerData.autoplay : true;
    const autoplayInterval = bannerData?.interval || 5000;
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
    return () => {
      clearInterval(timerRef.current);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [bannerData]);

  // PRELOAD SIGUIENTES SLIDES
  useEffect(() => {
    new Image().src = IMGS[(i + 1) % IMGS.length];
    new Image().src = IMGS[(i - 1 + IMGS.length) % IMGS.length];
  }, [i, IMGS]);

  // MOSTRAR/OCULTAR DOTS
  function handleUserActivity() {
    setShowDots(true);
    clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      setShowDots(false);
    }, 1500);
  }
  useEffect(() => {
    window.addEventListener("touchstart", handleUserActivity);
    return () => {
      window.removeEventListener("touchstart", handleUserActivity);
    };
  }, []);

  var savedMessage = localStorage.getItem("promoMessage");
  var backendMessage = bannerData?.message;
  var finalMessage = backendMessage || savedMessage || "Aprovechá hoy 3x2 en remeras 🧸";
  var mobileFontSize = bannerData?.mobileFontSize || 28;
  var mobileColor = bannerData?.mobileColor || '#d72660';

  if (loading) return null;

  return (
    <section className="promoBannerMobile">
      <div className="promoBannerMobile__slider">
        {IMGS.map((src, idx) => {
          const active = idx === i;
          const objPos = objectPositions[idx] || "center center";
          return (
            <img
              key={idx}
              src={src}
              alt=""
              draggable={false}
              className="promoBannerMobile__slide"
              style={{
                opacity: active ? 1 : 0,
                transform: active ? "scale(1)" : "scale(1.02)",
                objectPosition: objPos,
              }}
              loading={active ? "eager" : "lazy"}
            />
          );
        })}
        <div className="promoBannerMobile__overlay-blur" />
        <div className="promoBannerMobile__message-overlay">
          <div className="promoBannerMobile__message" style={{ fontSize: `${mobileFontSize}px`, color: mobileColor }}>
            <MarketingMessage message={finalMessage} />
          </div>
        </div>
        <div className={`promoBannerMobile__dots ${showDots ? "visible" : ""}`}>
          {IMGS.map((_, idx) => (
            <button
              key={idx}
              className={`promoBannerMobile__dot ${i === idx ? "active" : ""}`}
              onClick={() => setI(idx)}
              aria-label={`Ir al slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
      <span className="promoBannerMobile__a11yText">
        Slide {i + 1} de {IMGS.length}
      </span>
    </section>
  );
}
