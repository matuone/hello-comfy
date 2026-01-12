import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/myaccount.css";

export default function MyAccount() {
  const { loginAdmin, loginUser } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const isAdminEmail = email.endsWith("@hellocomfy.com");

    const result = isAdminEmail
      ? await loginAdmin(email, password)
      : await loginUser(email, password);

    if (result.success) {
      if (result.isAdmin) {
        navigate("/admin");
      } else {
        navigate("/mi-cuenta/perfil");
      }
    } else {
      setError("Email o contraseña incorrectos.");
    }
  }

  return (
    <div className="account-page">
      <div className="account-box">
        <h2 className="account-title">Mi cuenta</h2>
        <p className="account-subtitle">Ingresá para acceder a tu cuenta</p>

        <form onSubmit={handleSubmit} className="account-form">
          <div className="account-input-wrapper">
            <input
              className="account-input"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="account-input-wrapper">
            <input
              className="account-input account-input-password"
              type={showPassword ? "text" : "password"}
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button
              type="button"
              className="account-eye"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              <span
                className={
                  showPassword
                    ? "eye-icon eye-icon--visible"
                    : "eye-icon eye-icon--hidden"
                }
              />
            </button>
          </div>

          {error && <div className="login-error">{error}</div>}

          <button type="submit" className="account-btn">
            Iniciar sesión
          </button>
        </form>

        <a href="/create-account" className="account-link">
          Crear cuenta nueva
        </a>

        <a href="#" className="account-link small">
          ¿Olvidaste tu contraseña?
        </a>
      </div>
    </div>
  );
}
