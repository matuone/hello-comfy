import { useEffect, useState } from "react";
import bearCloud from "../assets/bear-cloud.png";
import "../styles/floatingbear.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function FloatingBear() {
  const [showCode, setShowCode] = useState(false);
  const [bearMessage, setBearMessage] = useState("HELLOCOMFY10");

  // Cargar mensaje desde el backend (fuente de verdad)
  useEffect(() => {
    fetch(`${API_URL}/promo-banner`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.bearMessage) setBearMessage(data.bearMessage);
      })
      .catch(() => {
        // fallback a localStorage
        const saved = localStorage.getItem("bearMessage");
        if (saved) setBearMessage(saved);
      });
  }, []);

  // 🔥 Escuchar cambios en vivo desde el admin
  useEffect(() => {
    function updateMessage() {
      const saved = localStorage.getItem("bearMessage");
      if (saved) setBearMessage(saved);
    }

    window.addEventListener("bearMessageUpdated", updateMessage);
    return () => window.removeEventListener("bearMessageUpdated", updateMessage);
  }, []);

  // Mostrar burbuja cada 10s durante 7s
  useEffect(() => {
    const interval = setInterval(() => {
      setShowCode(true);
      setTimeout(() => setShowCode(false), 7000);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="floating-bear">
      <img src={bearCloud} alt="Osito flotando" />

      {showCode && (
        <div className="discount-bubble">
          {bearMessage}
          <span className="dot"></span>
        </div>
      )}
    </div>
  );
}
