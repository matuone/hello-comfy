import { useState, useEffect } from "react";
import "../../styles/mobile/floatingbear.mobile.css";
import bearCloud from "../../assets/bear-cloud.png";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function FloatingBearMobile() {
  const [copied, setCopied] = useState(false);
  const [visible, setVisible] = useState(true);
  const [coupon, setCoupon] = useState("HELLOCOMFY10");

  useEffect(() => {
    fetch(`${API_URL}/promo-banner`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.bearMessage) setCoupon(data.bearMessage);
      })
      .catch(() => {
        const saved = localStorage.getItem("bearMessage");
        if (saved) setCoupon(saved);
      });
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(coupon);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  if (!visible) return null;

  return (
    <div className="floating-bear-mobile" onClick={handleCopy}>
      <button
        className="close-bear-mobile"
        aria-label="Cerrar osito"
        onClick={e => { e.stopPropagation(); setVisible(false); }}
      >
        ×
      </button>
      <img src={bearCloud} alt="Osito flotando" className="bear-img-mobile" />
      <div className="discount-bubble-mobile">
        {coupon}
        <span className="dot-mobile"></span>
      </div>
      {copied && <div className="copied-feedback-mobile">¡Copiado!</div>}
    </div>
  );
}
