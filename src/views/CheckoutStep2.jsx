export default function Step2({ formData, updateField, next, back }) {
  const needsAddress = formData.shippingMethod === "correo-home" || formData.shippingMethod === "home";
  const needsPostalCode = formData.shippingMethod === "correo-home" || formData.shippingMethod === "correo-branch"
    || formData.shippingMethod === "home";

  // Cambiar método de envío y limpiar campos del método anterior
  const handleShippingChange = (method) => {
    updateField("shippingMethod", method);
    if (method === "pickup") {
      // Limpiar campos de correo
      updateField("address", "");
      updateField("postalCode", "");
      updateField("province", "");
      updateField("localidad", "");
      updateField("selectedAgency", null);
      updateField("shippingPrice", 0);
    } else {
      // Limpiar campos de pickup
      updateField("pickPoint", "");
    }
  };

  const isValid =
    formData.shippingMethod === "pickup" ||
    (needsAddress &&
      (formData.address || "").trim().length > 3 &&
      (formData.postalCode || "").trim().length >= 4 &&
      (formData.province || "").trim().length > 2 &&
      (formData.localidad || "").trim().length > 2) ||
    (formData.shippingMethod === "correo-branch" &&
      (formData.postalCode || "").trim().length >= 4 &&
      (formData.province || "").trim().length > 2 &&
      (formData.localidad || "").trim().length > 2);

  return (
    <div className="checkout-step">
      <h2>Dirección de envío</h2>

      {/* ============================
          CAMPOS SEGÚN MÉTODO DE ENVÍO
      ============================ */}
      {formData.shippingMethod !== "pickup" && (
        <>
          {/* Dirección solo para envío a domicilio */}
          {needsAddress && (
            <div className="form-group">
              <label>Dirección</label>
              <input
                type="text"
                placeholder="Ej: Av. Siempreviva 742"
                value={formData.address}
                onChange={(e) => updateField("address", e.target.value)}
              />
            </div>
          )}

          <div className="form-group">
            <label>Código postal</label>
            <input
              type="text"
              placeholder="Ej: 1834"
              value={formData.postalCode}
              onChange={(e) => updateField("postalCode", e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Provincia</label>
            <input
              type="text"
              placeholder="Ej: Buenos Aires"
              value={formData.province}
              onChange={(e) => updateField("province", e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Localidad</label>
            <input
              type="text"
              placeholder="Ej: La Plata"
              value={formData.localidad || ""}
              onChange={(e) => updateField("localidad", e.target.value)}
            />
          </div>
        </>
      )}

      {/* ============================
          MÉTODO DE ENVÍO
      ============================ */}
      <h3>Método de envío</h3>

      <div className="shipping-options">
        {/* ⭐ PICK UP POINT */}
        <label>
          <input
            type="radio"
            name="shipping"
            checked={formData.shippingMethod === "pickup"}
            onChange={() => handleShippingChange("pickup")}
          />
          Retiro en Pick Up Point
        </label>

        {/* ⭐ ENVÍO A DOMICILIO — Correo Argentino */}
        <label>
          <input
            type="radio"
            name="shipping"
            checked={formData.shippingMethod === "correo-home" || formData.shippingMethod === "home"}
            onChange={() => handleShippingChange("correo-home")}
          />
          Envío a domicilio (Correo Argentino)
        </label>

        {/* ⭐ ENVÍO A SUCURSAL — Correo Argentino */}
        <label>
          <input
            type="radio"
            name="shipping"
            checked={formData.shippingMethod === "correo-branch"}
            onChange={() => handleShippingChange("correo-branch")}
          />
          Envío a sucursal (Correo Argentino)
        </label>
      </div>

      {/* ============================
          PICK UP POINT SELECTOR
      ============================ */}
      {formData.shippingMethod === "pickup" && (
        <div className="checkout-pickup-box">
          <h4 className="checkout-pickup-title">Elegí tu punto de retiro</h4>

          <select
            className="checkout-pickup-select"
            value={formData.pickPoint || ""}
            onChange={(e) => updateField("pickPoint", e.target.value)}
          >
            <option value="">Seleccioná un punto</option>
            <option value="aquelarre">Pick Up Point Aquelarre — CABA</option>
            <option value="temperley">Pick Up Point Temperley — ZS-GBA</option>
          </select>

          <p className="pd-secondary-text" style={{ marginTop: "4px" }}>
            Retiro sin costo. Te avisamos cuando esté listo.
          </p>
        </div>
      )}

      {/* ============================
          BOTONES
      ============================ */}
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
