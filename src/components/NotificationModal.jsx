import "../styles/notificationmodal.css";

export default function NotificationModal({ mensaje, tipo = "success", onClose }) {
  const icon = tipo === "success" ? "✓" : "✕";
  const title = tipo === "success" ? "¡Éxito!" : "Error";

  return (
    <div className="notification-modal-overlay" onClick={onClose}>
      <div className="notification-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className={`notification-modal-icon ${tipo}`}>
          {icon}
        </div>
        <h3 className="notification-modal-title">{title}</h3>
        <p className="notification-modal-message">{mensaje}</p>
        <button className="notification-modal-btn" onClick={onClose}>
          Aceptar
        </button>
      </div>
    </div>
  );
}
