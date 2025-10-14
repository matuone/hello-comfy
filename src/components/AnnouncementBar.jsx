import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

const DEFAULT_MESSAGES = [
  "Envío gratis en compras +$190.000 🚀",
  "10% OFF X TRANSFERENCIA 💸",
  "3 cuotas sin interés 🐻",
  "Envío gratis en compras +$190.000 💸",
];

// utilidades
const rotate = (arr, k) => arr.slice(k).concat(arr.slice(0, k));
const SEP = " \u00A0\u00A0•\u00A0\u00A0 "; // separador con espacios no separables

export default function AnnouncementBar({
  messages = DEFAULT_MESSAGES,
  brand = "Hello Comfy",
  showBear = true,
  speed = 35, // segundos por ciclo (más alto = más lento)
}) {
  const tickerRef = useRef(null);
  const seqRef = useRef(null);

  const [repeat, setRepeat] = useState(1);
  const [seqWidth, setSeqWidth] = useState(0);

  // Construye una secuencia “segura”: sin iguales consecutivos y con buena separación
  const buildSafeSequence = (base, rotations) => {
    let out = [];
    let last = null;

    for (let r = 0; r < rotations; r++) {
      const rot = rotate(base, r % base.length);
      for (const msg of rot) {
        if (msg === last) continue;            // evita iguales consecutivos
        out.push(msg);
        last = msg;
      }
      // separador visible grande entre “bloques” para más aire
      out.push("__GAP__"); // marcador que convertimos en espacios después
    }

    // si el último real y el primero real terminan iguales, metemos un GAP extra
    const firstReal = out.find((x) => x !== "__GAP__");
    const lastReal = [...out].reverse().find((x) => x !== "__GAP__");
    if (firstReal && lastReal && firstReal === lastReal) {
      out.unshift("__GAP__");
    }

    // transformamos en string con separadores
    const parts = [];
    for (const token of out) {
      if (token === "__GAP__") {
        parts.push(" \u00A0\u00A0\u00A0\u00A0 "); // espacio grande extra
      } else {
        if (parts.length > 0 && !parts[parts.length - 1].endsWith(" ")) {
          parts.push(SEP);
        }
        parts.push(token);
      }
    }
    return parts.join("");
  };

  // Medimos y repetimos hasta cubrir de sobra el ancho (para que nunca haya “aire”)
  useLayoutEffect(() => {
    const fit = () => {
      const base = messages.filter(Boolean);
      if (base.length === 0) return;

      const tickerW = tickerRef.current?.offsetWidth ?? 0;
      const target = tickerW + 120; // holgura

      let r = 2; // arrancamos con 2 rotaciones para garantizar variedad
      let width = 0;

      const measure = () => {
        const text = buildSafeSequence(base, r);
        // fijamos provisionalmente el contenido para medir
        if (seqRef.current) seqRef.current.textContent = text;
        requestAnimationFrame(() => {
          width = seqRef.current?.offsetWidth ?? 0;
          if (width < target && r < 30) {
            r += 1;
            measure();
          } else {
            setRepeat(r);
            setSeqWidth(width);
          }
        });
      };

      measure();
    };

    fit();
    const onResize = () => fit();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(messages)]);

  // bloque final seguro (con r rotaciones que evitan iguales vecinos)
  const safeBlock = buildSafeSequence(messages, repeat);

  return (
    <div className="announcement-bar" role="region" aria-label="Promociones">
      <Link to="/" className="ab-brand" aria-label={`${brand} (volver al inicio)`}>
        <span className="ab-brand-text">{brand}</span>
        {showBear && <span className="ab-bear" aria-hidden="true"> 🐻</span>}
      </Link>

      <div className="ab-ticker" ref={tickerRef}>
        <div
          className="ab-track"
          style={{
            "--distance": seqWidth ? `-${seqWidth}px` : "-1000px",
            "--duration": `${speed}s`,
          }}
        >
          {/* Dos mitades idénticas para loop perfecto */}
          <div className="ab-seq" ref={seqRef}>{safeBlock}</div>
          <div className="ab-seq" aria-hidden="true">{safeBlock}</div>
        </div>
      </div>
    </div>
  );
}
