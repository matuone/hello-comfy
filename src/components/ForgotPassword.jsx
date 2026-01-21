import { useState } from "react";

export default function ForgotPassword({ onSent }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === "Email inválido") {
          setError("Ingresá un email válido.");
        } else if (data.error === "El email no está registrado") {
          setError("El email no está registrado. Verificá que esté bien escrito o creá una cuenta nueva.");
        } else if (data.error === "No se pudo enviar el email") {
          setError("No se pudo enviar el email. Intentá de nuevo más tarde.");
        } else {
          setError(data.error || "No se pudo enviar el email");
        }
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError("Error de servidor");
    }
    setLoading(false);
  }

  return (
    <div className="forgot-password-modal">
      <h3>Recuperar contraseña</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Tu email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Enviando..." : "Enviar email de recuperación"}
        </button>
      </form>
      {error && <div className="forgot-error">{error}</div>}
      {success && (
        <div className="forgot-success">
          ¡Listo! Te enviamos un correo para recuperar tu contraseña.<br />
          <b>Revisá tu bandeja de entrada y la carpeta de spam.</b>
        </div>
      )}
    </div>
  );
}
