import "../styles/admin/facturamodal.css";

export default function FacturaModal({ isOpen, title, message, onConfirm, onCancel, loading = false }) {
  if (!isOpen) return null;

  return (
    <div className="factura-modal-overlay" onClick={onCancel}>
      <div className="factura-modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 className="factura-modal-title">{title}</h2>

        <p className="factura-modal-message">{message}</p>

        <div className="factura-modal-actions">
          <button
            className="factura-modal-btn cancel"
            onClick={onCancel}
            disabled={loading}
          >
            Cancelar
          </button>

          <button
            className="factura-modal-btn confirm"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Procesando..." : "Confirmar"}
          </button>
        </div>
      </div>
    </div>
  );
}
