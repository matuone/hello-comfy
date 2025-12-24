// src/views/AdminBanners.jsx
import { useState } from "react";
import "../styles/admin.css"; // 👈 usamos tu admin.css
import PromoBanner from "../components/PromoBanner";

export default function AdminBanners() {
  var saved = localStorage.getItem("promoMessage");

  var defaultMessage = "Aprovechá hoy 3x2 en remeras 🧸✨";

  var initial = saved ? saved : defaultMessage;

  const [message, setMessage] = useState(initial);
  const [error, setError] = useState("");

  function handleChange(e) {
    var value = e.target.value;

    if (value.length > 120) {
      setError("El mensaje no puede superar los 120 caracteres");
    } else {
      setError("");
    }

    setMessage(value);
  }

  function handleSave() {
    if (message.trim() === "") {
      setError("El mensaje no puede estar vacío");
      return;
    }

    if (message.length > 120) {
      setError("El mensaje supera el límite permitido");
      return;
    }

    localStorage.setItem("promoMessage", message);
    alert("Mensaje actualizado correctamente");
  }

  function handleReset() {
    setMessage(defaultMessage);
    localStorage.setItem("promoMessage", defaultMessage);
    alert("Mensaje restablecido al valor original");
  }

  return (
    <div className="admin-section">
      <h1 className="admin-title">Gestión de Banner</h1>
      <p className="admin-subtitle">
        Editá el texto que aparece sobre el banner principal.
      </p>

      {/* Vista previa */}
      <div className="admin-preview">
        <PromoBanner autoplay={false} fullBleed={false} />
      </div>

      <label className="admin-label">Texto del banner:</label>

      <textarea
        value={message}
        onChange={handleChange}
        className="admin-textarea"
      />

      {error && <p className="admin-error">{error}</p>}

      <div className="admin-buttons">
        <button className="admin-btn" onClick={handleSave}>
          Guardar mensaje
        </button>

        <button className="admin-btn secondary" onClick={handleReset}>
          Restablecer
        </button>
      </div>
    </div>
  );
}
