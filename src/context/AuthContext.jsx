import { createContext, useContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  // ============================
  // CARGAR LOGIN DESDE LOCALSTORAGE
  // ============================
  useEffect(() => {
    const savedUser = localStorage.getItem("authUser");
    const savedToken = localStorage.getItem("adminToken");

    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedToken && savedToken !== "undefined") setToken(savedToken);
  }, []);

  // ============================
  // LOGIN REAL (con backend)
  // ============================
  async function login(email, password) {
    try {
      const res = await fetch("http://localhost:5000/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.token) {
        return false;
      }

      // El backend ahora devuelve email + isAdmin
      const loggedUser = {
        email: data.email,
        isAdmin: data.isAdmin,
      };

      setUser(loggedUser);
      setToken(data.token);

      localStorage.setItem("authUser", JSON.stringify(loggedUser));
      localStorage.setItem("adminToken", data.token);

      return true;
    } catch (err) {
      console.error("Error en login:", err);
      return false;
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
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
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
