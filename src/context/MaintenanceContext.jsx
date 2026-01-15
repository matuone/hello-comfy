import { createContext, useContext, useState, useEffect } from "react";

export const MaintenanceContext = createContext();

export function MaintenanceProvider({ children }) {
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);

  // Cargar estado de localStorage
  useEffect(() => {
    const savedState = localStorage.getItem("maintenanceMode");
    if (savedState !== null) {
      setIsMaintenanceMode(JSON.parse(savedState));
    }
  }, []);

  // Guardar estado en localStorage
  const toggleMaintenanceMode = (value) => {
    setIsMaintenanceMode(value);
    localStorage.setItem("maintenanceMode", JSON.stringify(value));
  };

  return (
    <MaintenanceContext.Provider value={{ isMaintenanceMode, toggleMaintenanceMode }}>
      {children}
    </MaintenanceContext.Provider>
  );
}

export function useMaintenance() {
  const context = useContext(MaintenanceContext);
  if (!context) {
    throw new Error("useMaintenance debe ser usado dentro de MaintenanceProvider");
  }
  return context;
}
