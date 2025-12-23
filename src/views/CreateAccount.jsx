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
                  aria-label={
                    showPassword
                      ? "Ocultar contraseña"
                      : "Mostrar contraseña"
                  }
                >
                  {showPassword ? (
                    /* Ojo tachado */
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-5.05 0-9.29-3.14-11-8
                               1.05-2.88 3.05-5.22 5.65-6.64M1 1l22 22" />
                      <path d="M9.88 9.88A3 3 0 0 0 12 15a3 3 0 0 0 2.12-5.12" />
                    </svg>
                  ) : (
                    /* Ojo abierto */
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
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
                  aria-label={
                    showConfirmPassword
                      ? "Ocultar contraseña"
                      : "Mostrar contraseña"
                  }
                >
                  {showConfirmPassword ? (
                    /* Ojo tachado */
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-5.05 0-9.29-3.14-11-8
                               1.05-2.88 3.05-5.22 5.65-6.64M1 1l22 22" />
                      <path d="M9.88 9.88A3 3 0 0 0 12 15a3 3 0 0 0 2.12-5.12" />
                    </svg>
                  ) : (
                    /* Ojo abierto */
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
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
