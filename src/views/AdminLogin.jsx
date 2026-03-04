// src/views/AdminLogin.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/admin-login.css";

export default function AdminLogin() {
  const { loginAdmin } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await loginAdmin(email, password);

    if (result?.success) {
      navigate("/admin");
    } else {
      setError("Credenciales incorrectas. Verificá email y contraseña.");
    }
    setLoading(false);
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <div className="admin-login-logo">
          HELLO<span>COMFY</span>
        </div>
        <p className="admin-login-subtitle">Panel de administración</p>

        <form onSubmit={handleSubmit} className="admin-login-form">
          <label className="admin-login-label">
            Email
            <input
              type="email"
              placeholder="admin@hellocomfy.com.ar"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="admin-login-input"
              required
              autoFocus
            />
          </label>

          <label className="admin-login-label">
            Contraseña
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="admin-login-input"
              required
            />
          </label>

          <button type="submit" className="admin-login-btn" disabled={loading}>
            {loading ? "Ingresando..." : "Ingresar"}
          </button>

          {error && <p className="admin-login-error">{error}</p>}
        </form>
      </div>
    </div>
  );
}
