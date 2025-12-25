import { useLocation, useNavigate } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import "../styles/adminpanel.css";

export default function AdminCustomerDetail() {
  const navigate = useNavigate();
  const { state: cliente } = useLocation();

  if (!cliente) {
    return (
      <AdminLayout>
        <p>No se encontró información del cliente.</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-header">
        <h1 className="admin-title">Historial de {cliente.nombre}</h1>
        <p className="admin-welcome">Información completa del cliente</p>
      </div>

      <button className="btn-editar" onClick={() => navigate("/admin/customers")}>
        ← Volver
      </button>

      <section className="admin-section">
        <h2 className="section-title">Datos del cliente</h2>

        <div className="cliente-card" style={{ textAlign: "left" }}>
          <p><strong>Nombre:</strong> {cliente.nombre}</p>
          <p><strong>Email:</strong> {cliente.email}</p>
          <p><strong>Teléfono:</strong> {cliente.telefono}</p>
          <p><strong>Dirección:</strong> {cliente.direccion}</p>
          <p><strong>Registrado el:</strong> {cliente.fecha}</p>
        </div>
      </section>

      <section className="admin-section">
        <h2 className="section-title">Historial de pedidos</h2>

        <div className="ventas-lista">
          {cliente.pedidos.map((p) => (
            <div key={p.id} className="venta-item">
              <div>
                <p><strong>ID:</strong> {p.id}</p>
                <p><strong>Fecha:</strong> {p.fecha}</p>
                <p><strong>Total:</strong> ${p.total}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </AdminLayout>
  );
}
