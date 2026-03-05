// src/views/AdminDashboard.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

function apiPath(path) {
  const base = import.meta.env.VITE_API_URL || "/api";
  return path.startsWith("/") ? base + path : base + "/" + path;
}

export default function AdminDashboard() {
  const { adminFetch } = useAuth();
  const [stats, setStats] = useState(null);
  const [totalClientes, setTotalClientes] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, clientesRes] = await Promise.all([
          adminFetch(apiPath("/admin/stats")),
          fetch(apiPath("/customers/all-buyers")),
        ]);
        if (statsRes.ok) {
          const data = await statsRes.json();
          setStats(data);
        }
        if (clientesRes.ok) {
          const clientes = await clientesRes.json();
          setTotalClientes(Array.isArray(clientes) ? clientes.length : null);
        }
      } catch (err) {
        console.error("Error cargando stats del dashboard:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const fmt = (n) =>
    n != null ? `$${Number(n).toLocaleString("es-AR")}` : "$—";
  const num = (n) => (n != null ? n.toLocaleString("es-AR") : "—");

  return (
    <div className="admin-section">
      <h2 className="admin-section-title">Resumen general</h2>
      <p className="admin-section-text">
        Bienvenido al panel de administración de Hello Comfy. Acá vas a ver métricas,
        ventas, productos, stock y clientes.
      </p>
      <div className="admin-cards-grid">
        <div className="admin-card">
          <h3 className="admin-card-title">Ventas este mes</h3>
          <p className="admin-card-value">
            {loading ? "..." : fmt(stats?.facturadoMes)}
          </p>
        </div>
        <div className="admin-card">
          <h3 className="admin-card-title">Pedidos pendientes</h3>
          <p className="admin-card-value">
            {loading ? "..." : num(stats?.ventasPendientes)}
          </p>
        </div>
        <div className="admin-card">
          <h3 className="admin-card-title">Clientes registrados</h3>
          <p className="admin-card-value">
            {loading ? "..." : num(totalClientes)}
          </p>
        </div>
        <div className="admin-card">
          <h3 className="admin-card-title">Total de ventas</h3>
          <p className="admin-card-value">
            {loading ? "..." : num(stats?.totalVentas)}
          </p>
        </div>
        <div className="admin-card">
          <h3 className="admin-card-title">Facturado total</h3>
          <p className="admin-card-value">
            {loading ? "..." : fmt(stats?.totalFacturado)}
          </p>
        </div>
        <div className="admin-card">
          <h3 className="admin-card-title">Envíos realizados</h3>
          <p className="admin-card-value">
            {loading ? "..." : num(stats?.ventasEnviadas)}
          </p>
        </div>
      </div>
      {!loading && stats?.topProductos?.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <h3 className="admin-section-title" style={{ fontSize: "1.1rem" }}>
            Productos más vendidos
          </h3>
          <div className="admin-cards-grid">
            {stats.topProductos.slice(0, 4).map((p) => (
              <div className="admin-card" key={p.nombre}>
                <h3 className="admin-card-title" style={{ fontSize: "0.85rem" }}>
                  {p.nombre}
                </h3>
                <p className="admin-card-value">{p.cantidad} unid.</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
