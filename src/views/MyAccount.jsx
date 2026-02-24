import { useState, useEffect } from "react";
import ForgotPassword from "../components/ForgotPassword";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/myaccount.css";
import "../styles/forgotpassword.css";
import OpinionsPopup from "../components/OpinionsPopup";

export default function MyAccount() {
  const { loginAdmin, loginUser, user } = useAuth();
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL;
  function apiPath(path) {
    return API_URL.endsWith("/api") ? `${API_URL}${path}` : `${API_URL}/api${path}`;
  }

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [showForgot, setShowForgot] = useState(false);
  const [opinionsPopup, setOpinionsPopup] = useState(null);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [resendMsg, setResendMsg] = useState("");
  const [resending, setResending] = useState(false);

  // Si el usuario ya está logueado, redirigir al perfil
  useEffect(() => {
    if (user) {
      navigate("/mi-cuenta/perfil", { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    function handleShowOpinions(e) {
      setOpinionsPopup(e.detail.productId);
    }
    window.addEventListener("showProductOpinions", handleShowOpinions);
    return () => window.removeEventListener("showProductOpinions", handleShowOpinions);
  }, []);

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
        navigate("/");
      }
    } else if (result.needsVerification) {
      setNeedsVerification(true);
      setVerificationEmail(result.email);
    } else {
      setError("Email o contraseña incorrectos.");
    }
  }

  return (
    <>
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

            {needsVerification && (
              <div className="verification-notice">
                <p>📧 Tu email aún no fue verificado. Revisá tu bandeja de entrada.</p>
                <button
                  type="button"
                  className="account-btn account-btn--secondary"
                  disabled={resending}
                  onClick={async () => {
                    setResending(true);
                    setResendMsg("");
                    try {
                      const res = await fetch(apiPath("/auth/resend-verification"), {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ email: verificationEmail }),
                      });
                      const data = await res.json();
                      setResendMsg(data.message || "Email enviado");
                    } catch {
                      setResendMsg("Error al reenviar. Intentá de nuevo.");
                    }
                    setResending(false);
                  }}
                >
                  {resending ? "Enviando..." : "Reenviar email de verificación"}
                </button>
                {resendMsg && <p className="resend-msg">{resendMsg}</p>}
              </div>
            )}

            <button type="submit" className="account-btn">
              Iniciar sesión
            </button>
          </form>


          <a
            href="#"
            className="account-link small"
            onClick={e => { e.preventDefault(); setShowForgot(true); }}
          >
            ¿Olvidaste tu contraseña?
          </a>

          {showForgot && (
            <div className="modal-overlay" onClick={() => setShowForgot(false)}>
              <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={() => setShowForgot(false)}>&times;</button>
                <ForgotPassword onSent={() => setShowForgot(false)} />
              </div>
            </div>
          )}

          {opinionsPopup && (
            <OpinionsPopup productId={opinionsPopup} onClose={() => setOpinionsPopup(null)} />
          )}
        </div>
      </div>
    </>
  );
}
