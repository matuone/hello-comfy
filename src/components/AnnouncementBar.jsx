import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const DEFAULT_MESSAGES = [
  "Envío gratis en compras +$190.000 🚀",
  "10% OFF X TRANSFERENCIA 💸",
  "3 cuotas sin interés 🐻",
  "Envío gratis en compras +$190.000 💸",
];

// Detecta preferencia de “reduced motion”
function usePrefersReducedMotion() {
  const [prefers, setPrefers] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setPrefers(!!mql.matches);
    onChange();
    mql.addEventListener?.("change", onChange);
    return () => mql.removeEventListener?.("change", onChange);
  }, []);
  return prefers;
}

export default function AnnouncementBar({
  messages = DEFAULT_MESSAGES,
  brand = "Hello Comfy",   // sin guion
  showBear = true,
  speed = 22,              // segundos por vuelta (ajustá a gusto)
  separator = "•",         // separador entre mensajes
}) {
  const reduced = usePrefersReducedMotion();

  // Construye la secuencia de mensajes con separadores
  const sequence = messages.join(`  ${separator}  `);

  return (
    <div className="announcement-bar" role="region" aria-label="Promociones">
      {/* Marca clickeable */}
      <Link to="/" className="ab-brand" aria-label={`${brand} (volver al inicio)`}>
        <span className="ab-brand-text">{brand}</span>
        {showBear && <span className="ab-bear" aria-hidden="true"> 🐻</span>}
      </Link>

      {/* Ticker/marquée continuo */}
      <div className="ab-ticker" aria-hidden={!reduced ? true : undefined}>
        <div
          className={`ab-track ${reduced ? "no-motion" : ""}`}
          style={{ "--duration": `${speed}s` }}
        >
          {/* Duplicamos la secuencia para que el loop sea seamless */}
          <div className="ab-seq">{sequence}</div>
          <div className="ab-seq" aria-hidden="true">{sequence}</div>
        </div>
      </div>
    </div>
  );
}
