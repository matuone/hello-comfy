export default function Step4({ formData, items, totalPrice, back }) {
  const handleConfirm = () => {
    console.log("Orden lista para enviar al backend:", {
      formData,
      items,
      totalPrice,
    });

    alert("Orden creada (simulación). Próximo paso: backend real.");
  };

  const shippingLabel =
    formData.shippingMethod === "pickup"
      ? "Retiro en Pick Up Point"
      : "Envío a domicilio";

  const paymentLabel =
    formData.paymentMethod === "transfer"
      ? "Transferencia bancaria (10% OFF)"
      : "Tarjeta de débito / crédito";

  return (
    <div className="checkout-step">
      <h2>Revisión final</h2>

      <div className="review-box">
        {/* ============================
            DATOS DEL CLIENTE
        ============================ */}
        <h3>Datos del cliente</h3>
        <p><strong>Nombre:</strong> {formData.name}</p>
        <p><strong>Email:</strong> {formData.email}</p>
        <p><strong>Teléfono:</strong> {formData.phone}</p>

        {/* ============================
            ENVÍO
        ============================ */}
        <h3>Envío</h3>
        <p><strong>Método:</strong> {shippingLabel}</p>

        {formData.shippingMethod === "home" && (
          <>
            <p><strong>Dirección:</strong> {formData.address}</p>
            <p><strong>Código postal:</strong> {formData.postalCode}</p>
            <p><strong>Provincia:</strong> {formData.province}</p>
          </>
        )}

        {formData.shippingMethod === "pickup" && (
          <p>
            <strong>Punto de retiro:</strong>{" "}
            {formData.pickPoint === "aquelarre"
              ? "Aquelarre — CABA"
              : formData.pickPoint === "temperley"
                ? "Temperley — ZS-GBA"
                : "No seleccionado"}
          </p>
        )}

        {/* ============================
            PAGO
        ============================ */}
        <h3>Pago</h3>
        <p>{paymentLabel}</p>

        {/* ============================
            PRODUCTOS
        ============================ */}
        <h3>Productos</h3>
        {items.map((item) => (
          <p key={item.key}>
            {item.name} x{item.quantity}
          </p>
        ))}

        {/* ============================
            TOTAL
        ============================ */}
        <h3>Total</h3>
        <p style={{ fontWeight: 700, fontSize: "1.1rem" }}>
          ${totalPrice.toLocaleString("es-AR")}
        </p>
      </div>

      <div className="checkout-nav">
        <button className="checkout-btn-secondary" onClick={back}>
          Volver
        </button>
        <button className="checkout-btn" onClick={handleConfirm}>
          Confirmar compra
        </button>
      </div>
    </div>
  );
}
