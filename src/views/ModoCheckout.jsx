// src/views/ModoCheckout.jsx
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { consultarEstadoPago } from "../services/modoService";
import "../styles/payment.css";

export default function ModoCheckout() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const reference = searchParams.get("id");

  useEffect(() => {
    // En producción, aquí se mostraría el QR o se abriría la app de Modo
    console.log("Checkout de Modo para orden:", reference);
  }, [reference]);

  const handleSimularPago = async (status) => {
    setLoading(true);
    // Simular procesamiento
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (status === "success") {
      navigate(`/payment/success?method=modo&reference=${reference}`);
    } else {
      navigate(`/payment/failure?method=modo&reference=${reference}`);
    }
  };

  return (
    <div className="payment-result-container">
      <div className="payment-result-card">
        <div className="modo-checkout-header" style={{
          background: 'linear-gradient(135deg, #6F2DA8 0%, #9D4EDD 100%)',
          padding: '30px',
          borderRadius: '12px 12px 0 0',
          color: 'white',
          textAlign: 'center'
        }}>
          <h1 style={{ margin: '0 0 10px 0', fontSize: '28px' }}>Pagar con Modo</h1>
          <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>
            Modo Test - Simulación de pago
          </p>
        </div>

        <div style={{ padding: '30px' }}>
          <div style={{
            background: '#f8f8f8',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            <p style={{ margin: '0 0 10px 0', color: '#666' }}>
              Referencia de orden:
            </p>
            <p style={{
              margin: 0,
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#6F2DA8'
            }}>
              {reference}
            </p>
          </div>

          <div style={{
            border: '2px dashed #ddd',
            borderRadius: '8px',
            padding: '40px',
            textAlign: 'center',
            marginBottom: '20px'
          }}>
            <div style={{
              width: '200px',
              height: '200px',
              margin: '0 auto 20px',
              background: '#f0f0f0',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '48px'
            }}>
              📱
            </div>
            <p style={{ color: '#666', margin: '0 0 10px 0' }}>
              En producción, aquí se mostraría el código QR
            </p>
            <p style={{ color: '#999', fontSize: '14px', margin: 0 }}>
              o se abriría automáticamente la app de Modo
            </p>
          </div>

          <div style={{
            background: '#fff3cd',
            border: '1px solid #ffc107',
            borderRadius: '8px',
            padding: '15px',
            marginBottom: '20px'
          }}>
            <p style={{
              margin: 0,
              fontSize: '14px',
              color: '#856404'
            }}>
              ⚠️ <strong>Modo Test:</strong> Simula el resultado del pago usando los botones debajo
            </p>
          </div>

          <div style={{
            display: 'flex',
            gap: '10px',
            marginTop: '20px'
          }}>
            <button
              onClick={() => handleSimularPago("success")}
              disabled={loading}
              style={{
                flex: 1,
                padding: '15px',
                background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                transition: 'all 0.2s'
              }}
            >
              {loading ? "Procesando..." : "✅ Simular pago exitoso"}
            </button>

            <button
              onClick={() => handleSimularPago("failure")}
              disabled={loading}
              style={{
                flex: 1,
                padding: '15px',
                background: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                transition: 'all 0.2s'
              }}
            >
              {loading ? "Procesando..." : "❌ Simular pago fallido"}
            </button>
          </div>

          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <button
              onClick={() => navigate(-1)}
              style={{
                background: 'none',
                border: 'none',
                color: '#6F2DA8',
                textDecoration: 'underline',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              ← Volver al checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
