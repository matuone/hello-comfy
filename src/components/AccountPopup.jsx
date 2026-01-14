// src/components/AccountPopup.jsx
import "../styles/accountpopup.css";
import { useState } from "react";
import avatar from "../assets/avatar/avatar.png";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

export default function AccountPopup(props) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { user, logout, isAdmin, loginAdmin, loginUser } = useAuth();
  const navigate = useNavigate();

  function togglePassword() {
    setShowPassword(!showPassword);
  }

  function handleOverlayClick() {
    props.onClose();
  }

  function handlePopupClick(e) {
    e.stopPropagation();
  }

  function handleCloseClick() {
    props.onClose();
  }

  async function handleLoginSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email || !password) {
      setError("Por favor completa todos los campos");
      setLoading(false);
      return;
    }

    const isAdminEmail = email.endsWith("@hellocomfy.com");

    const result = isAdminEmail
      ? await loginAdmin(email, password)
      : await loginUser(email, password);

    if (result.success) {
      setEmail("");
      setPassword("");
      props.onClose();
      if (result.isAdmin) {
        navigate("/admin");
      } else {
        navigate("/mi-cuenta/perfil");
      }
    } else {
      setError("Email o contraseña incorrectos");
    }
    setLoading(false);
  }

  function handleLogoutClick() {
    logout();
    props.onClose();
  }

  function handleAdminClick() {
    props.onClose();
    navigate("/admin");
  }

  return (
    <div className="popup-overlay" onClick={handleOverlayClick}>
      <div className="popup" onClick={handlePopupClick}>

        {/* Botón cerrar (X) */}
        <button
          className="popup__close"
          onClick={handleCloseClick}
          aria-label="Cerrar popup"
        >
          &times;
        </button>

        {/* Foto de perfil */}
        <img
          src={user?.avatar || avatar}
          alt="Foto de perfil"
          className="popup__avatar"
          onError={(e) => {
            e.target.src = avatar;
          }}
        />

        {/* ============================
            SI EL USUARIO NO ESTÁ LOGUEADO
        ============================ */}
        {!user && (
          <>
            <form onSubmit={handleLoginSubmit} className="popup__form">
              {/* Campo email */}
              <input
                type="email"
                placeholder="Email"
                className="popup__input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              {/* Campo contraseña */}
              <div className="popup__password">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Contraseña"
                  className="popup__input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                <button
                  type="button"
                  className="popup__eye"
                  onClick={togglePassword}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                      viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-5.05 0-9.29-3.14-11-8
                               1.05-2.88 3.05-5.22 5.65-6.64M1 1l22 22" />
                      <path d="M9.88 9.88A3 3 0 0 0 12 15a3 3 0 0 0 2.12-5.12" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                      viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>

              {error && <p className="popup__error">{error}</p>}

              {/* Botones */}
              <div className="popup__buttons">
                <button
                  className="popup__btn login"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Iniciando..." : "Iniciar sesión"}
                </button>
              </div>
            </form>

            {/* Crear cuenta */}
            <p className="popup__register">
              ¿No tenés cuenta?{" "}
              <Link
                to="/register"
                className="popup__register-link"
                onClick={props.onClose}
              >
                Créala
              </Link>
            </p>

            <a href="#" className="popup__link">
              ¿Olvidaste tu contraseña?
            </a>
          </>
        )}

        {/* ============================
            SI EL USUARIO ESTÁ LOGUEADO
        ============================ */}
        {user && (
          <>
            <p className="popup__email">{user.name}</p>

            <div className="popup__buttons">

              {/* BOTÓN MI CUENTA */}
              <button
                className="popup__btn login"
                onClick={() => {
                  props.onClose();
                  navigate("/mi-cuenta/perfil");
                }}
              >
                Mi Cuenta
              </button>

              {/* BOTÓN ADMIN SOLO PARA ADMINS */}
              {isAdmin && (
                <button
                  className="popup__btn login"
                  onClick={handleAdminClick}
                >
                  Panel Admin
                </button>
              )}

              {/* LOGOUT */}
              <button
                className="popup__btn logout"
                onClick={handleLogoutClick}
              >
                Cerrar sesión
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
