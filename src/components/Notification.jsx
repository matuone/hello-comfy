import { useEffect } from "react";
import "../styles/notification.css";

export default function Notification({ mensaje, tipo = "exito", onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`noti-container noti-${tipo}`}>
      <span className="noti-icon">{tipo === "exito" ? "✅" : "⚠️"}</span>
      <span className="noti-text">{mensaje}</span>
      <button className="noti-close" onClick={onClose}>
        ✕
      </button>
    </div>
  );
}

