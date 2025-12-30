import "../styles/confirmmodal.css";

export default function ConfirmModal({ titulo, mensaje, onConfirm, onCancel }) {
  return (
    <div className="confirm-overlay">
      <div className="confirm-box">
        <h3 className="confirm-title">{titulo}</h3>
        <p className="confirm-message">{mensaje}</p>

        <div className="confirm-actions">
          <button className="confirm-btn confirm-cancel" onClick={onCancel}>
            Cancelar
          </button>

          <button className="confirm-btn confirm-accept" onClick={onConfirm}>
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}
