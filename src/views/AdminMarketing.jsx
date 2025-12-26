import { useState, useEffect } from "react";
import "../styles/adminmarketing.css";

export default function AdminMarketing() {
  const defaultMessage = "Aprovechá hoy 3x2 en remeras 🧸";
  const defaultBearMessage = "HELLOCOMFY10";

  const [message, setMessage] = useState("");
  const [bearMessage, setBearMessage] = useState("");

  // Cargar mensajes guardados
  useEffect(() => {
    const savedBanner = localStorage.getItem("promoMessage");
    const savedBear = localStorage.getItem("bearMessage");

    setMessage(savedBanner || defaultMessage);
    setBearMessage(savedBear || defaultBearMessage);
  }, []);

  function guardar() {
    localStorage.setItem("promoMessage", message);
    localStorage.setItem("bearMessage", bearMessage);
    alert("Mensajes actualizados correctamente.");
  }

  function resetear() {
    setMessage(defaultMessage);
    setBearMessage(defaultBearMessage);
    localStorage.setItem("promoMessage", defaultMessage);
    localStorage.setItem("bearMessage", defaultBearMessage);
  }

  return (
    <div className="admin-section">
      <h2 className="admin-section-title">Marketing</h2>
      <p className="admin-section-text">
        Personalizá los mensajes promocionales de la tienda.
      </p>

      <div className="marketing-box">
        {/* Banner principal */}
        <label className="marketing-label">Mensaje del banner</label>
        <textarea
          className="marketing-textarea"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
        />

        {/* Mensaje del osito */}
        <label className="marketing-label" style={{ marginTop: "20px" }}>
          Mensaje del osito flotante
        </label>
        <input
          className="marketing-textarea"
          value={bearMessage}
          onChange={(e) => setBearMessage(e.target.value)}
        />

        <div className="marketing-actions">
          <button className="btn-guardar" onClick={guardar}>
            Guardar mensaje
          </button>

          <button className="btn-resetear" onClick={resetear}>
            Resetear a default
          </button>
        </div>
      </div>

      {/* Vista previa del banner */}
      <div className="marketing-preview">
        <h3>Vista previa</h3>
        <div className="marketing-preview-box">{message}</div>
      </div>
    </div>
  );
}
