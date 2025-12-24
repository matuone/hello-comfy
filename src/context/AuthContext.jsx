// src/context/AuthContext.jsx
import { createContext, useContext, useState } from "react";
import { adminUsers } from "../data/adminUsers";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  function login(email, password) {
    const found = adminUsers.find(
      (u) => u.email === email && u.password === password
    );

    if (found) {
      setUser({ email: found.email });
      return true; // login OK
    }

    return false; // login fallido
  }

  function logout() {
    setUser(null);
  }

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
