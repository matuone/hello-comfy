import { useState } from "react";
import qrCuentaDNI from "../assets/qrcuentaDNI.jpeg";

export default function Step3({ formData, updateField, next, back }) {
  const isValid = (formData.paymentMethod || "") !== "";
  const [expandTransfer, setExpandTransfer] = useState(false);
  const [expandCuentaDNI, setExpandCuentaDNI] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);

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
            <>
              <button
                type="button"
                className="payment-expand-btn"
                onClick={() => setExpandCuentaDNI(!expandCuentaDNI)}
                style={{
                  marginLeft: "24px",
                  marginTop: "12px",
                  padding: "10px 16px",
                  background: "#e8f5f0",
                  color: "#00a86b",
                  border: "2px solid #00a86b",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                  fontWeight: "600",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "#00a86b";
                  e.target.style.color = "white";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "#e8f5f0";
                  e.target.style.color = "#00a86b";
                }}
              >
                {expandCuentaDNI ? "▼ Ocultar QR" : "▶ Ver código QR"}
              </button>

              {expandCuentaDNI && (
                <div
                  style={{
                    marginLeft: "24px",
                    marginTop: "12px",
                    padding: "16px",
                    background: "#f9f9f9",
                    border: "1px solid #eee",
                    borderRadius: "6px",
                  }}
                >
                  <p style={{ fontSize: "0.95rem", color: "#333", marginBottom: "12px" }}>
                    <strong>Escanea el código QR para poder realizar el pago</strong>
                  </p>
                  <img
                    src={qrCuentaDNI}
                    alt="QR Cuenta DNI"
                    onClick={() => setShowQRModal(true)}
                    style={{
                      maxWidth: "250px",
                      height: "auto",
                      borderRadius: "8px",
                      marginBottom: "12px",
                      cursor: "pointer",
                      transition: "transform 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = "scale(1.05)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = "scale(1)";
                    }}
                  />
                  <p style={{ fontSize: "0.85rem", color: "#666", margin: "12px 0 0 0" }}>
                    <em>
                      ℹ️ Las promociones de Cuenta DNI son propias de su plataforma.
                      Los reintegros se realizan de forma automática.
                    </em>
                  </p>
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

      {/* Modal para ampliar QR */}
      {showQRModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000,
            cursor: "pointer",
          }}
          onClick={() => setShowQRModal(false)}
        >
          <div
            style={{
              position: "relative",
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "12px",
              maxWidth: "90vw",
              maxHeight: "90vh",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={qrCuentaDNI}
              alt="QR Cuenta DNI Ampliado"
              style={{
                maxWidth: "100%",
                maxHeight: "70vh",
                borderRadius: "8px",
              }}
            />
            <p style={{ margin: "14px 0 0 0", fontSize: "1rem", color: "#333", textAlign: "center" }}>
              También podés abonar con nuestro Alias: <strong style={{ color: "#00a86b" }}>HELLOCOMFY.DNI</strong>
            </p>
            <button
              onClick={() => setShowQRModal(false)}
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                background: "#d94f7a",
                color: "white",
                border: "none",
                borderRadius: "50%",
                width: "40px",
                height: "40px",
                fontSize: "24px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "#c93b63";
                e.target.style.transform = "scale(1.1)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "#d94f7a";
                e.target.style.transform = "scale(1)";
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
