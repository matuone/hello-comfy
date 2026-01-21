import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/forgotpassword.css";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (password !== confirm) {
      setError("Las contraseñas no coinciden");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/auth/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudo actualizar la contraseña");
      } else {
        setSuccess(true);
        setTimeout(() => navigate("/mi-cuenta"), 2000);
      }
    } catch (err) {
      setError("Error de servidor");
    }
    setLoading(false);
  }

  return (
    <div className="forgot-password-modal" style={{ margin: "60px auto", maxWidth: 400 }}>
      <h3>Elegí tu nueva contraseña</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="Nueva contraseña"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Repetir contraseña"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Guardando..." : "Actualizar contraseña"}
        </button>
      </form>
      {error && <div className="forgot-error">{error}</div>}
      {success && <div className="forgot-success">¡Contraseña actualizada! Redirigiendo...</div>}
    </div>
  );
}
