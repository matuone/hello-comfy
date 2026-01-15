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

        {/* ⭐ Tarjeta de crédito/débito con Mercado Pago */}
        <label>
          <input
            type="radio"
            name="payment"
            checked={formData.paymentMethod === "mercadopago"}
            onChange={() => updateField("paymentMethod", "mercadopago")}
          />
          Tarjeta de débito / crédito (Mercado Pago)
        </label>

        {/* ⭐ Go Cuotas */}
        <label>
          <input
            type="radio"
            name="payment"
            checked={formData.paymentMethod === "gocuotas"}
            onChange={() => updateField("paymentMethod", "gocuotas")}
          />
          Financiar en cuotas (Go Cuotas)
        </label>

        {/* ⭐ Modo */}
        <label>
          <input
            type="radio"
            name="payment"
            checked={formData.paymentMethod === "modo"}
            onChange={() => updateField("paymentMethod", "modo")}
          />
          Pagar con MODO
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
