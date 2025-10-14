import { useEffect, useRef, useState } from "react";

const DEFAULT_MESSAGES = [
  "Envío gratis en compras +$190.000 🚀",
  "10% OFF X TRANSFERENCIA 💸",
  "3 cuotas sin interés 🐻",
  "Envío gratis en compras +$190.000 💸",
];

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
  interval = 3500,
}) {
  const [index, setIndex] = useState(0);
  const timerRef = useRef(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced || messages.length <= 1) return;
    timerRef.current = setInterval(
      () => setIndex((i) => (i + 1) % messages.length),
      interval
    );
    return () => clearInterval(timerRef.current);
  }, [messages.length, interval, reduced]);

  return (
    <div className="announcement-bar" role="region" aria-label="Promociones">
      <div className="ab-viewport" aria-live="polite">
        {messages.map((msg, i) => (
          <div key={i} className={`ab-slide ${i === index ? "is-active" : ""}`}>
            {msg}
          </div>
        ))}
      </div>
    </div>
  );
}
