import { createContext, useContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  // ============================
  // CARGAR SESIÓN DESDE LOCALSTORAGE
  // ============================
  useEffect(() => {
    const savedUser = localStorage.getItem("authUser");
    const savedAdminToken = localStorage.getItem("adminToken");
    const savedUserToken = localStorage.getItem("userToken");

    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    if (savedAdminToken && savedAdminToken !== "undefined") {
      setToken(savedAdminToken);
    }

    if (savedUserToken && savedUserToken !== "undefined") {
      setToken(savedUserToken);
    }
  }, []);

  // ============================
  // LOGIN AUTOMÁTICO DESPUÉS DE REGISTRO
  // ============================
  function loginAfterRegister(token, userData) {
    const loggedUser = {
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
      const res = await fetch("http://localhost:5000/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.token) return { success: false };

      const loggedUser = {
        id: data.id || null,
        email: data.email,
        name: data.name || null,
        avatar: data.avatar || null,
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
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.token || !data.user) {
        return { success: false };
      }

      const loggedUser = {
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
  // LOGOUT
  // ============================
  function logout() {
    setUser(null);
    setToken(null);
    localStorage.removeItem("authUser");
    localStorage.removeItem("adminToken");
    localStorage.removeItem("userToken");
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loginAdmin,
        loginUser,
        loginAfterRegister, // ⭐ NUEVO
        logout,
        isAdmin: user?.isAdmin === true,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
