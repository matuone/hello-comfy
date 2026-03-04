// src/views/AdminLogin.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/admin.css";


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
      setError("Credenciales incorrectas");
    }
    setLoading(false);
  }

  return (
    <div className="admin-login">
      <h1>Panel de Control</h1>
      <p>Ingresá con tu cuenta de administrador</p>

      <form onSubmit={handleSubmit} className="admin-login__form">
        <input
          type="email"
          placeholder="Email admin"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="admin-login__input"
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="admin-login__input"
        />

        <button type="submit" className="admin-login__button" disabled={loading}>
          {loading ? "Ingresando..." : "Ingresar"}
        </button>

        {error && <p className="admin-login__error">{error}</p>}
      </form>
    </div>
  );
}
