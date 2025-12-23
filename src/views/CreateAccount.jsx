// src/views/CreateAccount.jsx
import { useState } from "react";
import "../styles/createaccount.css";

export default function CreateAccount() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="layout__content--full">
      <section className="create-account">
        <div className="create-account__card">
          <h1 className="create-account__title">Crear tu cuenta</h1>
          <p className="create-account__subtitle">
            Unite al Hello Comfy! team 🧸✨
          </p>

          <form className="create-account__form">
            {/* FILA 1 */}
            <div className="create-account__field">
              <label>Nombre de usuario</label>
              <input placeholder="ej: matias_23" />
            </div>

            <div className="create-account__field">
              <label>Email</label>
              <input placeholder="tuemail@gmail.com" />
            </div>

            {/* FILA 2 */}
            <div className="create-account__field">
              <label>Nombre</label>
              <input placeholder="Tu nombre" />
            </div>

            <div className="create-account__field">
              <label>Apellido</label>
              <input placeholder="Tu apellido" />
            </div>

            {/* FILA 3 */}
            <div className="create-account__field">
              <label>Contraseña</label>
              <div className="create-account__password">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="********"
                />
                <button
                  type="button"
                  className="create-account__eye"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  👁
                </button>
              </div>
            </div>

            <div className="create-account__field">
              <label>Confirmar contraseña</label>
              <div className="create-account__password">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="********"
                />
                <button
                  type="button"
                  className="create-account__eye"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                >
                  👁
                </button>
              </div>
            </div>

            <button className="create-account__btn">
              Crear cuenta
            </button>
          </form>

          <div className="create-account__login">
            ¿Ya tenés cuenta? <a href="/login">Iniciar sesión</a>
          </div>
        </div>
      </section>
    </div>
  );
}
