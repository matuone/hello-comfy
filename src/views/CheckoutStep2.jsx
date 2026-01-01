export default function Step2({ formData, updateField, next, back }) {
  return (
    <div className="checkout-step">
      <h2>Dirección de envío</h2>

      <div className="form-group">
        <label>Dirección</label>
        <input
          type="text"
          value={formData.address}
          onChange={(e) => updateField("address", e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Código postal</label>
        <input
          type="text"
          value={formData.postalCode}
          onChange={(e) => updateField("postalCode", e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Provincia</label>
        <input
          type="text"
          value={formData.province}
          onChange={(e) => updateField("province", e.target.value)}
        />
      </div>

      <h3>Método de envío</h3>
      <div className="shipping-options">
        <label>
          <input
            type="radio"
            name="shipping"
            checked={formData.shippingMethod === "pickup"}
            onChange={() => updateField("shippingMethod", "pickup")}
          />
          Retiro en showroom
        </label>

        <label>
          <input
            type="radio"
            name="shipping"
            checked={formData.shippingMethod === "home"}
            onChange={() => updateField("shippingMethod", "home")}
          />
          Envío a domicilio
        </label>
      </div>

      <div className="checkout-nav">
        <button className="checkout-btn-secondary" onClick={back}>
          Volver
        </button>
        <button className="checkout-btn" onClick={next}>
          Siguiente
        </button>
      </div>
    </div>
  );
}
