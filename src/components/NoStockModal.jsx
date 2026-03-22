import "../styles/modal.css";

export default function NoStockModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-container"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 360 }}
      >
        <div className="modal-header" style={{ flexDirection: "column", alignItems: "center", gap: 8, padding: "24px 20px 16px" }}>
          <span style={{ fontSize: 44, lineHeight: 1 }}>📦</span>
          <h2 className="modal-title" style={{ textAlign: "center", fontSize: 18, color: "white" }}>
            Sin stock disponible
          </h2>
        </div>

        <div className="modal-body" style={{ textAlign: "center", padding: "20px 24px" }}>
          <p style={{ fontSize: 15, color: "#555", lineHeight: 1.6 }}>
            Por el momento este producto <strong>no tiene unidades disponibles</strong>.
          </p>
          <p style={{ marginTop: 10, fontSize: 13, color: "#888" }}>
            Volvé pronto, ¡siempre estamos reponiendo stock! 🛍️
          </p>
        </div>

        <div className="modal-footer" style={{ justifyContent: "center" }}>
          <button className="modal-btn" onClick={onClose}>
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
