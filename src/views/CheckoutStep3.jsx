import { useState } from "react";

export default function Step3({ formData, updateField, next, back }) {
  const isValid = (formData.paymentMethod || "") !== "";

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
            <p style={{ fontSize: "0.85rem", color: "#666", marginLeft: "24px", marginTop: "8px", fontStyle: "italic" }}>
              ℹ️ Los datos bancarios se mostrarán en el siguiente paso.
            </p>
          )}
        </div>

        {/* ⭐ Cuenta DNI */}
        <div className="payment-option-group">
          <label>
            <input
              type="radio"
              name="payment"
              checked={formData.paymentMethod === "cuentadni"}
              onChange={() => updateField("paymentMethod", "cuentadni")}
            />
            <span style={{ color: "#00a86b", fontWeight: 600 }}>
              Cuenta DNI
            </span>
          </label>

          {formData.paymentMethod === "cuentadni" && (
            <p style={{ fontSize: "0.85rem", color: "#666", marginLeft: "24px", marginTop: "8px", fontStyle: "italic" }}>
              ℹ️ El QR y los datos de pago se mostrarán en el siguiente paso.
            </p>
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
          <span style={{ color: "#00a6d6", fontWeight: 600 }}>
            Tarjeta de débito / crédito (Mercado Pago)
          </span>
        </label>

        {/* ⭐ Go Cuotas */}
        <label>
          <input
            type="radio"
            name="payment"
            checked={formData.paymentMethod === "gocuotas"}
            onChange={() => updateField("paymentMethod", "gocuotas")}
          />
          <span style={{ color: "#d94f7a", fontWeight: 600 }}>
            Financiar en cuotas (Go Cuotas)
          </span>
        </label>

        {/* ⭐ Modo */}
        <label>
          <input
            type="radio"
            name="payment"
            checked={formData.paymentMethod === "modo"}
            onChange={() => updateField("paymentMethod", "modo")}
          />
          <span style={{ color: "#20b042", fontWeight: 600 }}>
            Pagar con MODO
          </span>
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
