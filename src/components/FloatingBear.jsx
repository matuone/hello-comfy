import { useEffect, useState } from "react";
import bearCloud from "../assets/bear-cloud.png";
import "../styles/floatingbear.css";

export default function FloatingBear() {
  const [showCode, setShowCode] = useState(false);
  const [bearMessage, setBearMessage] = useState("HELLOCOMFY10");

  // Cargar mensaje inicial del osito
  useEffect(() => {
    const saved = localStorage.getItem("bearMessage");
    if (saved) setBearMessage(saved);
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
