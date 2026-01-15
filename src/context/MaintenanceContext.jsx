import { createContext, useContext, useState, useEffect } from "react";

export const MaintenanceContext = createContext();

export function MaintenanceProvider({ children }) {
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [loading, setLoading] = useState(true);

  // Cargar estado desde el backend
  useEffect(() => {
    fetchMaintenanceStatus();
    
    // Polling cada 30 segundos para mantener actualizado
    const interval = setInterval(fetchMaintenanceStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchMaintenanceStatus = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/config/maintenance");
      const data = await response.json();
      setIsMaintenanceMode(data.maintenanceMode);
    } catch (error) {
      console.error("Error al obtener estado de mantenimiento:", error);
    } finally {
      setLoading(false);
    }
  };

  // Actualizar estado en el backend
  const toggleMaintenanceMode = async (value) => {
    try {
      const token = localStorage.getItem("adminToken");
      
      if (!token) {
        console.error("No hay token de admin");
        return;
      }
      
      console.log("Actualizando modo mantenimiento a:", value);
      
      const response = await fetch("http://localhost:5000/api/config/maintenance", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ maintenanceMode: value }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Modo mantenimiento actualizado:", data);
        setIsMaintenanceMode(data.maintenanceMode);
      } else {
        const errorData = await response.text();
        console.error("Error del servidor:", response.status, errorData);
      }
    } catch (error) {
      console.error("Error al actualizar modo mantenimiento:", error);
    }
  };

  return (
    <MaintenanceContext.Provider value={{ isMaintenanceMode, toggleMaintenanceMode, loading }}>
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
