import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import "../styles/register.css";

const API_URL = import.meta.env.VITE_API_URL;

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [status, setStatus] = useState("loading"); // loading | success | error
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Token de verificación no encontrado.");
      return;
    }

    async function verify() {
      try {
        const res = await fetch(`${API_URL}/auth/verify-email?token=${token}`);
        const data = await res.json();

        if (res.ok) {
          setStatus("success");
          setMessage(data.message || "Email verificado correctamente.");
        } else {
          setStatus("error");
          setMessage(data.error || "Token inválido o expirado.");
        }
      } catch {
        setStatus("error");
        setMessage("Error al verificar el email.");
      }
    }

    verify();
  }, [token]);

  return (
    <div className="register-container" style={{ textAlign: "center", paddingTop: "60px" }}>
      {status === "loading" && (
        <>
          <h2>Verificando tu email...</h2>
          <p style={{ color: "#666", marginTop: "12px" }}>Esperá un momento.</p>
        </>
      )}

      {status === "success" && (
        <>
          <h2 style={{ color: "#2e7d32" }}>✅ Email verificado</h2>
          <p style={{ color: "#555", marginTop: "12px", fontSize: "16px" }}>{message}</p>
          <button
            onClick={() => navigate("/mi-cuenta")}
            style={{
              marginTop: "24px",
              background: "#d94f7a",
              color: "#fff",
              border: "none",
              padding: "14px 32px",
              borderRadius: "10px",
              fontSize: "15px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Iniciar sesión
          </button>
        </>
      )}

      {status === "error" && (
        <>
          <h2 style={{ color: "#d32f2f" }}>❌ Error de verificación</h2>
          <p style={{ color: "#555", marginTop: "12px", fontSize: "16px" }}>{message}</p>
          <button
            onClick={() => navigate("/register")}
            style={{
              marginTop: "24px",
              background: "#d94f7a",
              color: "#fff",
              border: "none",
              padding: "14px 32px",
              borderRadius: "10px",
              fontSize: "15px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Volver al registro
          </button>
        </>
      )}
    </div>
  );
}
