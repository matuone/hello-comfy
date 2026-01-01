export default function Step4({ formData, items, totalPrice, back }) {
  const handleConfirm = () => {
    console.log("Orden lista para enviar al backend:", {
      formData,
      items,
      totalPrice,
    });

    alert("Orden creada (simulación). Próximo paso: backend real.");
  };

  return (
    <div className="checkout-step">
      <h2>Revisión final</h2>

      <div className="review-box">
        <h3>Datos del cliente</h3>
        <p>{formData.name}</p>
        <p>{formData.email}</p>
        <p>{formData.phone}</p>

        <h3>Envío</h3>
        <p>{formData.address}</p>
        <p>{formData.postalCode}</p>
        <p>{formData.province}</p>
        <p>Método: {formData.shippingMethod}</p>

        <h3>Pago</h3>
        <p>{formData.paymentMethod}</p>

        <h3>Productos</h3>
        {items.map((item) => (
          <p key={item.key}>
            {item.name} x{item.quantity}
          </p>
        ))}

        <h3>Total</h3>
        <p>${totalPrice.toLocaleString("es-AR")}</p>
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
