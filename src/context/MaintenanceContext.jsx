import { createContext, useContext, useState, useEffect, useRef } from "react";

export const MaintenanceContext = createContext();

export function MaintenanceProvider({ children }) {
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const API_URL = import.meta.env.VITE_API_URL;
  const lastUpdateRef = useRef(0); // Track last manual update time
  const apiPath = (path) => `${API_URL}${path}`;

  // Cargar estado desde el backend
  useEffect(() => {
    fetchMaintenanceStatus();

    // Polling cada 30 segundos para mantener actualizado
    const interval = setInterval(() => {
      // Solo refetch si no hubo cambio manual en los últimos 5 segundos
      const timeSinceLastUpdate = Date.now() - lastUpdateRef.current;
      if (timeSinceLastUpdate > 5000) {
        fetchMaintenanceStatus();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchMaintenanceStatus = async () => {
    try {
      const response = await fetch(apiPath("/config/maintenance"));
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        console.log("GET /config/maintenance =>", data);
        setIsMaintenanceMode(data.maintenanceMode);
      } else {
        const text = await response.text();
        console.error("Respuesta no es JSON:", text);
      }
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

      // Actualizar timestamp para evitar polling reverso
      lastUpdateRef.current = Date.now();
      
      // Actualizar estado local INMEDIATAMENTE
      setIsMaintenanceMode(value);
      console.log("Toggle local actualizado a:", value);

      const response = await fetch(apiPath("/config/maintenance"), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ maintenanceMode: value }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Modo mantenimiento guardado en BD:", data);
        setIsMaintenanceMode(data.maintenanceMode);
      } else {
        const errorData = await response.text();
        console.error("Error del servidor:", response.status, errorData);
        // Revertir estado local si la petición falla
        setIsMaintenanceMode(!value);
      }
    } catch (error) {
      console.error("Error al actualizar modo mantenimiento:", error);
      // Revertir estado local si hay error
      setIsMaintenanceMode(!value);
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
