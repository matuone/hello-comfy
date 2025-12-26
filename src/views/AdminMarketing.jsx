import { useState, useEffect } from "react";
import "../styles/adminmarketing.css";

export default function AdminMarketing() {
  const defaultMessage = "Aprovechá hoy 3x2 en remeras 🧸";

  const [message, setMessage] = useState("");

  // Cargar mensaje guardado
  useEffect(() => {
    const saved = localStorage.getItem("promoMessage");
    setMessage(saved || defaultMessage);
  }, []);

  function guardar() {
    localStorage.setItem("promoMessage", message);
    alert("Mensaje actualizado correctamente.");
  }

  function resetear() {
    setMessage(defaultMessage);
    localStorage.setItem("promoMessage", defaultMessage);
  }

  return (
    <div className="admin-section">
      <h2 className="admin-section-title">Marketing</h2>
      <p className="admin-section-text">
        Personalizá el mensaje que aparece en el banner principal de la tienda.
      </p>

      <div className="marketing-box">
        <label className="marketing-label">Mensaje del banner</label>

        <textarea
          className="marketing-textarea"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
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

      <div className="marketing-preview">
        <h3>Vista previa</h3>
        <div className="marketing-preview-box">{message}</div>
      </div>
    </div>
  );
}
