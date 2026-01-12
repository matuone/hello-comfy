import { createContext, useContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);     // Admin o usuario normal
  const [token, setToken] = useState(null);   // Token correspondiente

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

    // Si existe token admin → lo usamos
    if (savedAdminToken && savedAdminToken !== "undefined") {
      setToken(savedAdminToken);
    }

    // Si existe token usuario → lo usamos
    if (savedUserToken && savedUserToken !== "undefined") {
      setToken(savedUserToken);
    }
  }, []);

  // ============================
  // LOGIN ADMIN (BACKEND)
  // ============================
  async function loginAdmin(email, password) {
    try {
      const res = await fetch("http://localhost:5000/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.token) {
        return { success: false };
      }

      const loggedUser = {
        id: data.id || null,
        email: data.email,
        name: data.name || null,
        avatar: data.avatar || null,
        isAdmin: true,
      };

      setUser(loggedUser);
      setToken(data.token);

      // Guardar sesión admin
      localStorage.setItem("authUser", JSON.stringify(loggedUser));
      localStorage.setItem("adminToken", data.token);
      localStorage.removeItem("userToken"); // Por si había sesión usuario

      return { success: true, isAdmin: true };
    } catch (err) {
      console.error("Error en login admin:", err);
      return { success: false };
    }
  }

  // ============================
  // LOGIN USUARIO NORMAL (BACKEND)
  // ============================
  async function loginUser(email, password) {
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.token) {
        return { success: false };
      }

      const loggedUser = {
        id: data.id,
        email: data.email,
        name: data.name,
        avatar: data.avatar || null,
        isAdmin: false,
      };

      setUser(loggedUser);
      setToken(data.token);

      // Guardar sesión usuario
      localStorage.setItem("authUser", JSON.stringify(loggedUser));
      localStorage.setItem("userToken", data.token);
      localStorage.removeItem("adminToken"); // Por si había sesión admin

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
