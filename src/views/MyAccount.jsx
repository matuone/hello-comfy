import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/myaccount.css";

export default function MyAccount() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();

    const success = login(email, password);

    if (success) {
      navigate("/admin");
    } else {
      setError("Email o contraseña incorrectos.");
    }
  }

  return (
    <div className="account-page">
      <div className="account-box">
        <h2 className="account-title">Mi cuenta</h2>
        <p className="account-subtitle">Ingresá para acceder al panel</p>

        <form onSubmit={handleSubmit} className="account-form">

          {/* Email con wrapper para igualar tamaños */}
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

          {/* Contraseña con ojito */}
          <div className="account-input-wrapper">
            <input
              className="account-input"
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
              {showPassword ? (
                /* Ojo tachado */
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                  viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-5.05 0-9.29-3.14-11-8
                           1.05-2.88 3.05-5.22 5.65-6.64M1 1l22 22" />
                  <path d="M9.88 9.88A3 3 0 0 0 12 15a3 3 0 0 0 2.12-5.12" />
                </svg>
              ) : (
                /* Ojo abierto */
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                  viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
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
