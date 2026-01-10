export default function Step3({ formData, updateField, next, back }) {
  const isValid = formData.paymentMethod !== "";

  return (
    <div className="checkout-step">
      <h2>Método de pago</h2>

      <div className="payment-options">
        {/* ⭐ Transferencia */}
        <label>
          <input
            type="radio"
            name="payment"
            checked={formData.paymentMethod === "transfer"}
            onChange={() => updateField("paymentMethod", "transfer")}
          />
          Transferencia bancaria (10% OFF)
        </label>

        {/* ⭐ Tarjeta */}
        <label>
          <input
            type="radio"
            name="payment"
            checked={formData.paymentMethod === "card"}
            onChange={() => updateField("paymentMethod", "card")}
          />
          Tarjeta de débito / crédito
        </label>
      </div>

      <div className="checkout-nav">
        <button className="checkout-btn-secondary" onClick={back}>
          Volver
        </button>

        <button
          className="checkout-btn"
          onClick={next}
          disabled={!isValid}
          style={{
            opacity: isValid ? 1 : 0.5,
            cursor: isValid ? "pointer" : "default",
          }}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
