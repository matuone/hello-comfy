
import { createContext, useContext, useState, useEffect, useRef } from "react";
import LoadingSpinner from "../components/LoadingSpinner";

// Configuración global de API para compatibilidad local/producción
const API_URL = import.meta.env.VITE_API_URL;
function apiPath(path) {
  return `${API_URL}${path}`;
}

export const AuthContext = createContext();

function InactivityModal({ open, onClose }) {
  if (!open) return null;
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.35)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background:
            "linear-gradient(135deg, #ffb6b3 0%, #ff7e7e 100%)",
          color: "#fff",
          borderRadius: 16,
          padding: "40px 32px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
          textAlign: "center",
          maxWidth: 340,
          fontFamily: "inherit",
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ marginBottom: 16, fontWeight: 700 }}>
          ¡Sesión cerrada por inactividad!
        </h2>
        <p style={{ fontSize: "1.1rem", marginBottom: 24 }}>
          Por tu seguridad, cerramos tu sesión luego de 20 minutos sin actividad.
          <br />
          <span
            style={{
              fontSize: "0.95rem",
              opacity: 0.85,
            }}
          >
            Podés volver a iniciar sesión cuando quieras 😊
          </span>
        </p>
        <button
          style={{
            background: "#fff",
            color: "#ff7e7e",
            border: "none",
            borderRadius: 8,
            padding: "10px 24px",
            fontWeight: 600,
            fontSize: "1rem",
            cursor: "pointer",
            marginTop: 8,
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
          onClick={onClose}
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}

// ============================
// MODAL DE SESIÓN EXPIRADA
// ============================
function TokenExpiredModal({ open, onClose }) {
  if (!open) return null;
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.4)",
        zIndex: 10000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "linear-gradient(135deg, #ff9a56 0%, #ff6b6b 100%)",
          color: "#fff",
          borderRadius: 16,
          padding: "40px 32px",
          boxShadow: "0 12px 48px rgba(0,0,0,0.25)",
          textAlign: "center",
          maxWidth: 360,
          fontFamily: "inherit",
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ marginBottom: 12, fontWeight: 700, fontSize: "1.3rem" }}>
          ⏰ Sesión Expirada
        </h2>
        <p style={{ fontSize: "1rem", marginBottom: 28, lineHeight: "1.5" }}>
          Tu sesión de administrador ha expirado por seguridad.
          <br />
          Por favor, vuelve a iniciar sesión para continuar.
        </p>
        <button
          style={{
            background: "#fff",
            color: "#ff6b6b",
            border: "none",
            borderRadius: 8,
            padding: "12px 32px",
            fontWeight: 600,
            fontSize: "1rem",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            transition: "transform 0.2s",
          }}
          onClick={onClose}
          onMouseOver={(e) => e.target.style.transform = "scale(1.05)"}
          onMouseOut={(e) => e.target.style.transform = "scale(1)"}
        >
          Iniciar Sesión
        </button>
      </div>
    </div>
  );
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [showInactivityModal, setShowInactivityModal] = useState(false);
  const [showTokenExpiredModal, setShowTokenExpiredModal] = useState(false);
  const [isValidatingAdminToken, setIsValidatingAdminToken] = useState(false);
  const logoutTimer = useRef(null);
  const INACTIVITY_LIMIT = 20 * 60 * 1000; // 20 minutos en ms

  // ============================
  // AUTO-LOGOUT POR INACTIVIDAD
  // ============================
  useEffect(() => {
    // Solo usuarios normales, no admins
    if (!user || user.isAdmin) return;

    function resetTimer() {
      if (logoutTimer.current) clearTimeout(logoutTimer.current);
      logoutTimer.current = setTimeout(() => {
        logout();
        setShowInactivityModal(true);
      }, INACTIVITY_LIMIT);
    }

    // Eventos de actividad
    const events = ["mousemove", "keydown", "scroll", "click", "touchstart"];
    events.forEach((e) => window.addEventListener(e, resetTimer));
    resetTimer();

    return () => {
      if (logoutTimer.current) clearTimeout(logoutTimer.current);
      events.forEach((e) => window.removeEventListener(e, resetTimer));
    };
  }, [user && !user.isAdmin]);

  // ============================
  // CARGAR SESIÓN DESDE LOCALSTORAGE Y REFRESCAR DATOS DESDE API
  // ============================
  useEffect(() => {
    const savedUser = localStorage.getItem("authUser");
    const savedAdminToken = localStorage.getItem("adminToken");
    const savedUserToken = localStorage.getItem("userToken");

    let tokenToUse = null;
    if (savedAdminToken && savedAdminToken !== "undefined") {
      setToken(savedAdminToken);
      tokenToUse = savedAdminToken;
    } else if (savedUserToken && savedUserToken !== "undefined") {
      setToken(savedUserToken);
      tokenToUse = savedUserToken;
    }

    // Si hay usuario y token, refrescar datos desde la API (solo usuarios normales, no admins)
    if (savedUser && tokenToUse) {
      const parsedUser = JSON.parse(savedUser);
      // Si es admin, validar que el token sea válido antes de restaurar la sesión
      if (parsedUser.isAdmin) {
        // Mostrar spinner mientras se valida
        setIsValidatingAdminToken(true);

        // Validar el token del admin
        fetch(apiPath("/admin/verify"), {
          method: "POST",
          headers: {
            Authorization: `Bearer ${tokenToUse}`,
          },
        })
          .then((res) => {
            if (res.ok) {
              setUser(parsedUser);
              setToken(tokenToUse);
              setIsValidatingAdminToken(false);
            } else {
              // Token expirado o inválido, hacer logout
              localStorage.removeItem("authUser");
              localStorage.removeItem("adminToken");
              localStorage.removeItem("userToken");
              setIsValidatingAdminToken(false);
            }
          })
          .catch(() => {
            // Error al validar, hacer logout por seguridad
            localStorage.removeItem("authUser");
            localStorage.removeItem("adminToken");
            localStorage.removeItem("userToken");
            setIsValidatingAdminToken(false);
          });
        return;
      }
      // Si no hay id válido, forzar logout y no hacer fetch
      if (!parsedUser.id || parsedUser.id === "null" || parsedUser.id === null || parsedUser.id === undefined) {
        setUser(null);
        setToken(null);
        localStorage.removeItem("authUser");
        localStorage.removeItem("adminToken");
        localStorage.removeItem("userToken");
        return;
      }
      // Traer datos frescos desde la API para usuarios normales
      fetch(apiPath(`/users/${parsedUser.id}`), {
        headers: {
          Authorization: `Bearer ${tokenToUse}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data && data.user) {
            setUser(data.user);
            localStorage.setItem("authUser", JSON.stringify(data.user));
          } else {
            setUser(parsedUser); // fallback
          }
        })
        .catch(() => {
          setUser(parsedUser); // fallback si falla fetch
        });
    }
  }, []);

  // ============================
  // LOGIN AUTOMÁTICO DESPUÉS DE REGISTRO
  // ============================
  function loginAfterRegister(token, userData) {
    // Guardar todos los datos relevantes del usuario
    const loggedUser = {
      ...userData,
      id: userData.id,
      email: userData.email,
      name: userData.name,
      avatar: userData.avatar || null,
      isAdmin: userData.isAdmin || false,
    };
    setUser(loggedUser);
    setToken(token);
    localStorage.setItem("authUser", JSON.stringify(loggedUser));
    localStorage.setItem("userToken", token);
    localStorage.removeItem("adminToken");
  }

  // ============================
  // LOGIN ADMIN
  // ============================
  async function loginAdmin(email, password) {
    try {
      const res = await fetch(apiPath("/admin/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.token) return { success: false };

      // Guardar todos los datos relevantes del usuario admin
      const loggedUser = {
        ...data.user,
        id: data.id || data.user?.id || null,
        email: data.email || data.user?.email,
        name: data.name || data.user?.name || null,
        avatar: data.avatar || data.user?.avatar || null,
        isAdmin: true,
      };
      setUser(loggedUser);
      setToken(data.token);
      localStorage.setItem("authUser", JSON.stringify(loggedUser));
      localStorage.setItem("adminToken", data.token);
      localStorage.removeItem("userToken");

      return { success: true, isAdmin: true };
    } catch (err) {
      console.error("Error en login admin:", err);
      return { success: false };
    }
  }

  // ============================
  // LOGIN USUARIO NORMAL
  // ============================
  async function loginUser(email, password) {
    try {
      const res = await fetch(apiPath("/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.token || !data.user) {
        return { success: false };
      }

      // Guardar todos los datos relevantes del usuario
      const loggedUser = {
        ...data.user,
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        avatar: data.user.avatar || null,
        isAdmin: false,
      };
      setUser(loggedUser);
      setToken(data.token);
      localStorage.setItem("authUser", JSON.stringify(loggedUser));
      localStorage.setItem("userToken", data.token);
      localStorage.removeItem("adminToken");

      return { success: true, isAdmin: false };
    } catch (err) {
      console.error("Error en login usuario:", err);
      return { success: false };
    }
  }

  // ============================
  // ACTUALIZAR AVATAR
  // ============================
  function updateUserAvatar(newAvatarUrl) {
    if (user) {
      const updatedUser = {
        ...user,
        avatar: newAvatarUrl,
      };
      setUser(updatedUser);
      localStorage.setItem("authUser", JSON.stringify(updatedUser));
    }
  }

  // ============================
  // LOGOUT
  // ============================
  function logout() {
    setUser(null);
    setToken(null);
    localStorage.removeItem("authUser");
    localStorage.removeItem("adminToken");
    localStorage.removeItem("userToken");
  }

  // ============================
  // HELPER: FETCH CON MANEJO DE 401 PARA ADMIN
  // ============================
  async function adminFetch(url, options = {}) {
    const adminToken = localStorage.getItem("adminToken");

    const headers = {
      ...options.headers,
      "Authorization": `Bearer ${adminToken}`,
    };

    try {
      const res = await fetch(url, { ...options, headers });

      // Si recibimos 401, el token es inválido/expirado
      if (res.status === 401) {
        setShowTokenExpiredModal(true);
        logout();
        throw new Error("Sesión expirada. Por favor, inicia sesión nuevamente.");
      }

      return res;
    } catch (err) {
      throw err;
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loginAdmin,
        loginUser,
        loginAfterRegister,
        updateUserAvatar,
        logout,
        adminFetch,
        isAdmin: user?.isAdmin === true,
        isValidatingAdminToken,
      }}
    >
      {children}

      {/* Spinner mientras se valida token del admin */}
      <LoadingSpinner
        visible={isValidatingAdminToken}
        message="Validando sesión..."
        fullScreen={true}
      />

      <InactivityModal
        open={showInactivityModal}
        onClose={() => setShowInactivityModal(false)}
      />

      <TokenExpiredModal
        open={showTokenExpiredModal}
        onClose={() => {
          setShowTokenExpiredModal(false);
          window.location.href = "/admin";
        }}
      />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
