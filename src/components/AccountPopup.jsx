// src/components/AccountPopup.jsx
import "../styles/accountpopup.css";
import { useState } from "react";
import avatar from "../assets/avatar/avatar.png";

export default function AccountPopup({ onClose }) {
  const [showPassword, setShowPassword] = useState(false);

  function togglePassword() {
    setShowPassword(!showPassword);
  }

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup" onClick={(e) => e.stopPropagation()}>
        {/* Foto de perfil */}
        <img src={avatar} alt="Foto de perfil" className="popup__avatar" />

        {/* Campo email */}
        <input type="email" placeholder="Email" className="popup__input" />

        {/* Campo contraseña con botón ojo minimalista */}
        <div className="popup__password">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Contraseña"
            className="popup__input"
          />
          <button
            type="button"
            className="popup__eye"
            onClick={togglePassword}
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

        {/* Botones */}
        <div className="popup__buttons">
          <button className="popup__btn login">Iniciar sesión</button>
          <button className="popup__btn logout" onClick={onClose}>
            Cerrar sesión
          </button>
        </div>

        {/* Nuevo bloque crear cuenta */}
        <p className="popup__register">
          ¿No tenés cuenta? <a href="#" className="popup__register-link">Créala</a>
        </p>

        {/* Link recuperar contraseña */}
        <a href="#" className="popup__link">
          ¿Olvidaste tu contraseña?
        </a>
      </div>
    </div>
  );
}
