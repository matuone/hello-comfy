export default function ConfirmProofModal({ isOpen, onConfirm, onCancel, paymentMethod = "transfer" }) {
  if (!isOpen) return null;

  const isCuentaDNI = paymentMethod === "cuentadni";
  const title = isCuentaDNI ? "Comprobante de Cuenta DNI" : "Comprobante de Transferencia";
  const mainText = isCuentaDNI 
    ? "Por favor adjuntá el comprobante de Cuenta DNI para poder confirmar tu compra."
    : "Por favor adjuntá el comprobante para poder confirmar tu compra.";
  const secondaryText = isCuentaDNI
    ? "Si en este momento no podés hacerlo, podés enviarlo por WhatsApp después de realizar la compra."
    : "Si en este momento no podés hacerlo, podés enviarlo por WhatsApp después de realizar la compra.";

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "16px",
          padding: "40px 32px",
          maxWidth: "500px",
          width: "90%",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
          textAlign: "center",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              fontSize: "48px",
              backgroundColor: "#fff7fb",
              borderRadius: "50%",
              width: "80px",
              height: "80px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "12px",
            }}
          >
            ⚠️
          </div>
        </div>

        {/* Título */}
        <h2
          style={{
            color: "#333",
            fontSize: "24px",
            margin: "0 0 16px 0",
            fontWeight: "700",
          }}
        >
          {title}
        </h2>

        {/* Texto principal */}
        <p
          style={{
            color: "#666",
            fontSize: "16px",
            lineHeight: "1.6",
            margin: "0 0 24px 0",
          }}
        >
          {mainText}
        </p>

        {/* Texto secundario */}
        <div
          style={{
            backgroundColor: "#f8f8f8",
            padding: "16px",
            borderRadius: "8px",
            marginBottom: "24px",
            borderLeft: "4px solid #d94f7a",
          }}
        >
          <p
            style={{
              color: "#555",
              fontSize: "14px",
              lineHeight: "1.6",
              margin: "0",
            }}
          >
            {secondaryText}
          </p>
        </div>

        {/* Pregunta */}
        <p
          style={{
            color: "#333",
            fontSize: "15px",
            margin: "0 0 32px 0",
            fontWeight: "600",
          }}
        >
          ¿Deseas continuar sin adjuntar comprobante?
        </p>

        {/* Botones */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            justifyContent: "center",
          }}
        >
          <button
            onClick={onCancel}
            style={{
              padding: "12px 32px",
              border: "2px solid #d94f7a",
              backgroundColor: "white",
              color: "#d94f7a",
              borderRadius: "24px",
              fontSize: "15px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#f5f5f5";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "white";
            }}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: "12px 32px",
              backgroundColor: "#d94f7a",
              color: "white",
              border: "none",
              borderRadius: "24px",
              fontSize: "15px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#c93b63";
              e.target.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "#d94f7a";
              e.target.style.transform = "translateY(0)";
            }}
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
}
