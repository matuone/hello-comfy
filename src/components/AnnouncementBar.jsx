import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

const DEFAULT_MESSAGES = [
  "Envío gratis en compras +$190.000 🚀",
  "10% OFF X TRANSFERENCIA 💸",
  "3 cuotas sin interés 🐻",
  "Envío gratis en compras +$190.000 💸",
];

export default function AnnouncementBar({
  messages = DEFAULT_MESSAGES,
  brand = "Hello Comfy",
  showBear = true,
  separator = "•",
  speed = 35,
}) {
  const tickerRef = useRef(null);
  const seqRef = useRef(null);
  const [repeat, setRepeat] = useState(1);
  const [seqWidth, setSeqWidth] = useState(0);

  // añadimos un espacio extra entre los bloques
  const joined = messages.join(`   ${separator}   `) + "      "; // ← extra gap visual

  useLayoutEffect(() => {
    function fit() {
      const tickerW = tickerRef.current?.offsetWidth ?? 0;
      const target = tickerW + 80;
      let r = 1;
      setRepeat(1);
      requestAnimationFrame(() => {
        const measure = () => {
          setRepeat(r);
          requestAnimationFrame(() => {
            const w = seqRef.current?.offsetWidth ?? 0;
            if (w < target && r < 20) {
              r += 1;
              measure();
            } else {
              setSeqWidth(w);
            }
          });
        };
        measure();
      });
    }

    fit();
    const onResize = () => fit();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [joined]);

  const block = Array.from({ length: repeat }, () => joined).join("");

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
          <div className="ab-seq" ref={seqRef}>{block}</div>
          <div className="ab-seq" aria-hidden="true">{block}</div>
        </div>
      </div>
    </div>
  );
}
