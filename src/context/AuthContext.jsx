import { createContext, useState, useContext } from "react";
import { adminUsers } from "../data/adminUsers";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  function login(email, password) {
    const found = adminUsers.find(
      (u) => u.email === email && u.password === password
    );

    if (found) {
      setUser({ email });
      return true;
    }

    return false;
  }

  function logout() {
    setUser(null);
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
