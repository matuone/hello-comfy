import "../styles/modal.css";

export default function Modal({ isOpen, title, message, onClose, type = "info" }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className={`modal-container modal-${type}`}>
        <div className="modal-header">
          {type === "success" && <span className="modal-icon">✓</span>}
          {type === "error" && <span className="modal-icon error">✕</span>}
          {type === "warning" && <span className="modal-icon warning">!</span>}
          {type === "info" && <span className="modal-icon info">i</span>}
          <h2 className="modal-title">{title}</h2>
        </div>
        <div className="modal-body">
          <p>{message}</p>
        </div>
        <div className="modal-footer">
          <button className="modal-btn" onClick={onClose}>
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}
