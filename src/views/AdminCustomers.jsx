import { useState } from "react";
import AdminLayout from "./AdminLayout";
import "../styles/adminpanel.css";

export default function AdminCustomers() {
  // ============================
  // CLIENTES DE EJEMPLO
  // ============================
  const [clientes, setClientes] = useState([
    {
      id: "U001",
      nombre: "María López",
      email: "maria@gmail.com",
      fecha: "2024-11-12",
      pedidos: 5,
    },
    {
      id: "U002",
      nombre: "Juan Pérez",
      email: "juanperez@gmail.com",
      fecha: "2024-12-01",
      pedidos: 2,
    },
    {
      id: "U003",
      nombre: "Lucía Fernández",
      email: "luciaf@gmail.com",
      fecha: "2025-01-05",
      pedidos: 3,
    },
  ]);

  // ============================
  // BORRAR CLIENTE
  // ============================
  function borrarCliente(id) {
    if (confirm("¿Seguro que querés borrar este cliente?")) {
      setClientes(prev => prev.filter(c => c.id !== id));
    }
  }

  // ============================
  // VER HISTORIAL (placeholder)
  // ============================
  function verHistorial(cliente) {
    alert(`Acá se mostraría el historial de compras de ${cliente.nombre}`);
    // Más adelante podemos crear AdminCustomerDetail.jsx
  }

  return (
    <AdminLayout>
      {/* HEADER */}
      <div className="admin-header">
        <h1 className="admin-title">Clientes</h1>
        <p className="admin-welcome">Listado de clientes registrados</p>
      </div>

      {/* ============================
          LISTA DE CLIENTES
      ============================ */}
      <section className="admin-section">
        <h2 className="section-title">Clientes registrados</h2>

        <div className="clientes-grid">
          {clientes.map(cliente => (
            <div key={cliente.id} className="cliente-card">
              <h3 className="cliente-nombre">{cliente.nombre}</h3>
              <p className="cliente-email">{cliente.email}</p>
              <p className="cliente-fecha">
                Registrado el: <strong>{cliente.fecha}</strong>
              </p>
              <p className="cliente-pedidos">
                Pedidos realizados: <strong>{cliente.pedidos}</strong>
              </p>

              <button
                className="btn-editar"
                onClick={() => verHistorial(cliente)}
              >
                Ver historial
              </button>

              <button
                className="btn-borrar"
                onClick={() => borrarCliente(cliente.id)}
              >
                Borrar cliente
              </button>
            </div>
          ))}
        </div>
      </section>
    </AdminLayout>
  );
}
