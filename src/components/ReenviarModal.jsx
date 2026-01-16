import React, { useEffect } from "react";
import "../styles/reenviar-modal.css";

export default function ReenviarModal({ tipo, titulo, mensaje, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="reenviar-modal-overlay">
      <div className={`reenviar-modal reenviar-modal-${tipo}`}>
        <div className="reenviar-modal-icon">
          {tipo === "exito" ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          )}
        </div>

        <h2 className="reenviar-modal-titulo">{titulo}</h2>
        <p className="reenviar-modal-mensaje">{mensaje}</p>

        <button className="reenviar-modal-btn" onClick={onClose}>
          Cerrar
        </button>
      </div>
    </div>
  );
}
