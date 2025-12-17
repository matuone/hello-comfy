// src/components/AnnouncementBar.jsx
import { useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/announcementbar.css";

const DEFAULT_MESSAGES = [
  "Envío gratis en compras +$190.000 🚀",
  "10% OFF X TRANSFERENCIA 💸",
  "3 cuotas sin interés 🐻",
  "Envío gratis en compras +$190.000 💸",
];

const rotate = (arr, k) => arr.slice(k).concat(arr.slice(0, k));
const SEP = " \u00A0\u00A0•\u00A0\u00A0 ";

export default function AnnouncementBar({
  messages = DEFAULT_MESSAGES,
  brand = "Hello Comfy",
  showBear = true,
  speed = 35,
}) {
  const tickerRef = useRef(null);
  const seqRef = useRef(null);
  const rootRef = useRef(null);

  const [repeat, setRepeat] = useState(1);
  const [seqWidth, setSeqWidth] = useState(0);

  const buildSafeSequence = (base, rotations) => {
    let out = [];
    let last = null;
    for (let r = 0; r < rotations; r++) {
      const rot = rotate(base, r % base.length);
      for (const msg of rot) {
        if (msg === last) continue;
        out.push(msg);
        last = msg;
      }
      out.push("__GAP__");
    }
    const firstReal = out.find((x) => x !== "__GAP__");
    const lastReal = [...out].reverse().find((x) => x !== "__GAP__");
    if (firstReal && lastReal && firstReal === lastReal) {
      out.unshift("__GAP__");
    }
    const parts = [];
    for (const token of out) {
      if (token === "__GAP__") {
        parts.push(" \u00A0\u00A0\u00A0\u00A0 ");
      } else {
        if (parts.length > 0 && !parts[parts.length - 1].endsWith(" ")) {
          parts.push(SEP);
        }
        parts.push(token);
      }
    }
    return parts.join("");
  };

  useLayoutEffect(() => {
    const fit = () => {
      const base = messages.filter(Boolean);
      if (base.length === 0) return;
      const tickerW = tickerRef.current?.offsetWidth ?? 0;
      const target = tickerW + 120;
      let r = 2;
      let width = 0;
      const measure = () => {
        const text = buildSafeSequence(base, r);
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
  }, [JSON.stringify(messages)]);

  useLayoutEffect(() => {
    const updateHeight = () => {
      if (!rootRef.current) return;
      const h = rootRef.current.offsetHeight || 0;
      document.documentElement.style.setProperty("--ab-height", `${h}px`);
    };
    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  const safeBlock = buildSafeSequence(messages, repeat);

  return (
    <div
      ref={rootRef}
      className="announcement-bar"
      role="region"
      aria-label="Promociones"
    >
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
          <div className="ab-seq" ref={seqRef}>{safeBlock}</div>
          <div className="ab-seq" aria-hidden="true">{safeBlock}</div>
        </div>
      </div>
    </div>
  );
}
