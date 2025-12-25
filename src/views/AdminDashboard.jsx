// src/views/AdminDashboard.jsx
export default function AdminDashboard() {
  return (
    <div className="admin-section">
      <h2 className="admin-section-title">Resumen general</h2>
      <p className="admin-section-text">
        Bienvenido al panel de administración de Hello Comfy. Acá vas a ver métricas,
        ventas, productos, stock y clientes.
      </p>
      <div className="admin-cards-grid">
        <div className="admin-card">
          <h3 className="admin-card-title">Ventas hoy</h3>
          <p className="admin-card-value">$0</p>
        </div>
        <div className="admin-card">
          <h3 className="admin-card-title">Pedidos pendientes</h3>
          <p className="admin-card-value">0</p>
        </div>
        <div className="admin-card">
          <h3 className="admin-card-title">Clientes registrados</h3>
          <p className="admin-card-value">0</p>
        </div>
      </div>
    </div>
  );
}
