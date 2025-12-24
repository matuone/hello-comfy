// src/views/MyAccount.jsx
import { useState } from "react";
import "../styles/myaccount.css";

export default function MyAccount() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e) {
    e.preventDefault();

    // Por ahora solo mostramos los datos
    console.log("Intento de login:", email, password);

    alert("Esto es solo una vista. El login real se conectará al backend.");
  }

  function handleEmailChange(e) {
    setEmail(e.target.value);
  }

  function handlePasswordChange(e) {
    setPassword(e.target.value);
  }

  return (
    <div className="account-page">
      <div className="account-box">

        <h1 className="account-title">Mi cuenta</h1>
        <p className="account-subtitle">
          Iniciá sesión para ver tus pedidos y datos personales
        </p>

        <form className="account-form" onSubmit={handleSubmit}>
          <input
            type="email"
            className="account-input"
            placeholder="Email"
            value={email}
            onChange={handleEmailChange}
          />

          <input
            type="password"
            className="account-input"
            placeholder="Contraseña"
            value={password}
            onChange={handlePasswordChange}
          />

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
