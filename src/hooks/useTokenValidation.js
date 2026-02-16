import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";

// ============================
// HOOK PARA DETECTAR ERRORES 401
// ============================
// Este hook puede ser usado en vistas admin para mostrar notificaciones personalizadas
// cuando se detecte un 401 error
export function useTokenValidation(onTokenExpired) {
  const { adminFetch: originalAdminFetch } = useAuth();

  useEffect(() => {
    // Este hook es principalmente informativo
    // El manejo real de 401 se hace en el AuthContext
    // Pero lo dejamos disponible para componentes que quieran reaccionar
  }, [onTokenExpired]);

  return { onTokenExpired };
}

// ============================
// COMPONENTE DE NOTIFICACIÓN DE SESIÓN EXPIRADA
// ============================
export function TokenExpiredNotification() {
  const { showTokenExpiredModal } = useAuth?.() || {};

  if (!showTokenExpiredModal) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 20,
        right: 20,
        background: "linear-gradient(135deg, #ff6b6b 0%, #ff5252 100%)",
        color: "#fff",
        padding: "16px 24px",
        borderRadius: 8,
        boxShadow: "0 4px 12px rgba(255,107,107,0.3)",
        fontSize: "0.95rem",
        fontWeight: 500,
        zIndex: 9999,
        animation: "slideIn 0.3s ease",
      }}
    >
      ⏰ Tu sesión ha expirado
      <style>
        {`
          @keyframes slideIn {
            from {
              transform: translateX(400px);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `}
      </style>
    </div>
  );
}
