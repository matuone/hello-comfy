import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import "../styles/adminpanel.css";

export default function AdminCustomers() {
  const navigate = useNavigate();

  const [clientes] = useState([
    {
      id: "U001",
      nombre: "María López",
      email: "maria@gmail.com",
      telefono: "11-2345-6789",
      direccion: "Av. Siempre Viva 123",
      fecha: "2024-11-12",
      pedidos: [
        { id: "A001", total: 12500, fecha: "2025-01-24" },
        { id: "A003", total: 15200, fecha: "2025-01-23" }
      ]
    },
    {
      id: "U002",
      nombre: "Juan Pérez",
      email: "juanperez@gmail.com",
      telefono: "11-9876-5432",
      direccion: "Calle Falsa 456",
      fecha: "2024-12-01",
      pedidos: [
        { id: "A002", total: 8900, fecha: "2025-01-24" }
      ]
    }
  ]);

  function verHistorial(cliente) {
    navigate(`/admin/customers/${cliente.id}`, { state: cliente });
  }

  return (
    <AdminLayout>
      <div className="admin-header">
        <h1 className="admin-title">Clientes</h1>
        <p className="admin-welcome">Listado de clientes registrados</p>
      </div>

      <section className="admin-section">
        <h2 className="section-title">Clientes registrados</h2>

        <div className="tabla-clientes-container">
          <table className="tabla-clientes">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Dirección</th>
                <th>Registrado</th>
                <th>Pedidos</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {clientes.map((c) => (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td>{c.nombre}</td>
                  <td>{c.email}</td>
                  <td>{c.telefono}</td>
                  <td>{c.direccion}</td>
                  <td>{c.fecha}</td>
                  <td>{c.pedidos.length}</td>
                  <td>
                    <button
                      className="btn-tabla"
                      onClick={() => verHistorial(c)}
                    >
                      Ver historial
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AdminLayout>
  );
}
