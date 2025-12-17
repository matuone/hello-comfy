// src/components/AccountPopup.jsx
import "../styles/accountpopup.css";
import avatar from "../assets/avatar/avatar.png"; // 👈 import correcto

export default function AccountPopup({ onClose }) {
  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup" onClick={(e) => e.stopPropagation()}>
        {/* Foto de perfil */}
        <img
          src={avatar}
          alt="Foto de perfil"
          className="popup__avatar"
        />

        {/* Campos de login */}
        <input type="email" placeholder="Email" className="popup__input" />
        <input type="password" placeholder="Contraseña" className="popup__input" />

        {/* Botones */}
        <div className="popup__buttons">
          <button className="popup__btn login">Iniciar sesión</button>
          <button className="popup__btn logout" onClick={onClose}>
            Cerrar sesión
          </button>
        </div>

        {/* Link recuperar contraseña */}
        <a href="#" className="popup__link">
          ¿Olvidaste tu contraseña?
        </a>
      </div>
    </div>
  );
}
