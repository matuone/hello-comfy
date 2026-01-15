import { useState } from "react";

export default function Step3({ formData, updateField, next, back }) {
  const isValid = formData.paymentMethod !== "";
  const [expandTransfer, setExpandTransfer] = useState(false);

  const bankInfo = {
    banco: "Banco Santander",
    cuenta: "CAJA DE AHORRO EN PESOS 000-642556/6",
    cbu: "0720000788000064255668",
    alias: "GRANO.PLAYA.PRISMA",
    titular: "CASTELLS ZWEIFEL NICOLE CAROLINA",
    cuit: "CUIT 27391049802",
  };

  return (
    <div className="checkout-step">
      <h2>Método de pago</h2>

      <div className="payment-options">
        {/* ⭐ Transferencia */}
        <div className="payment-option-group">
          <label>
            <input
              type="radio"
              name="payment"
              checked={formData.paymentMethod === "transfer"}
              onChange={() => updateField("paymentMethod", "transfer")}
            />
            <span style={{ color: "#d94f7a", fontWeight: 600 }}>
              Transferencia bancaria (10% OFF)
            </span>
          </label>

          {formData.paymentMethod === "transfer" && (
            <>
              <button
                type="button"
                className="payment-expand-btn"
                onClick={() => setExpandTransfer(!expandTransfer)}
                style={{
                  marginLeft: "24px",
                  marginTop: "12px",
                  padding: "10px 16px",
                  background: "#fff7fb",
                  color: "#d94f7a",
                  border: "2px solid #d94f7a",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                  fontWeight: "600",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "#d94f7a";
                  e.target.style.color = "white";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "#fff7fb";
                  e.target.style.color = "#d94f7a";
                }}
              >
                {expandTransfer ? "▼ Ocultar datos" : "▶ Ver datos bancarios"}
              </button>

              {expandTransfer && (
                <div
                  style={{
                    marginLeft: "24px",
                    marginTop: "12px",
                    padding: "12px",
                    background: "#f9f9f9",
                    border: "1px solid #eee",
                    borderRadius: "6px",
                    fontSize: "0.9rem",
                    lineHeight: "1.8",
                  }}
                >
                  <p><strong>{bankInfo.banco}</strong></p>
                  <p>Cuenta: {bankInfo.cuenta}</p>
                  <p>CBU: {bankInfo.cbu}</p>
                  <p>Alias: <strong>{bankInfo.alias}</strong></p>
                  <p>Titular: {bankInfo.titular}</p>
                  <p>{bankInfo.cuit}</p>
                </div>
              )}
            </>
          )}
        </div>

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
