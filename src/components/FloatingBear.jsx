// src/components/FloatingBear.jsx
import { useEffect, useState } from "react";
import bearCloud from "../assets/bear-cloud.png";
import "../styles/floatingbear.css"; // estilos del osito

export default function FloatingBear() {
  const [showCode, setShowCode] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowCode(true);
      // 👇 ahora dura 7 segundos visible
      setTimeout(() => setShowCode(false), 7000);
    }, 10000); // cada 10s aparece
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="floating-bear">
      <img src={bearCloud} alt="Osito flotando" />
      {showCode && (
        <div className="discount-bubble">
          HELLOCOMFY10
          <span className="dot"></span>
        </div>
      )}
    </div>
  );
}
