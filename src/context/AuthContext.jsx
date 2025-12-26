import { createContext, useContext, useState, useEffect } from "react";
import { adminUsers } from "../data/adminUsers";

export const AuthContext = createContext(); // ← export nombrado

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("authUser");
    if (saved) {
      setUser(JSON.parse(saved));
    }
  }, []);

  function login(email, password) {
    const found = adminUsers.find(
      (u) => u.email === email && u.password === password
    );

    if (found) {
      const loggedUser = { email: found.email };
      setUser(loggedUser);
      localStorage.setItem("authUser", JSON.stringify(loggedUser));
      return true;
    }

    return false;
  }

  function logout() {
    setUser(null);
    localStorage.removeItem("authUser");
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
