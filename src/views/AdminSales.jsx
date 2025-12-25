// src/views/AdminSales.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/adminsales.css";

export default function AdminSales() {
  const [busqueda, setBusqueda] = useState("");

  const [ventasData, setVentasData] = useState([
    {
      id: "8256",
      fecha: "23/12/2025 15:10",
      cliente: "Camila Cabrera Iglesias",
      email: "cabreracamila@gmail.com",
      telefono: "+54 9 11 6937 0079",
      total: "$60.361,74",
      productos: "1 unid.",
      pagoEstado: "recibido",
      envio: "Enviada (Andreani Estándar)",
    },
    {
      id: "8255",
      fecha: "22/12/2025 20:37",
      cliente: "Carolina Raggetti",
      email: "raggetti.carolina@gmail.com",
      telefono: "+54 9 11 5555 1234",
      total: "$35.550,00",
      productos: "1 unid.",
      pagoEstado: "pendiente",
      envio: "Por empaquetar (Andreani Online - Showroom)",
    },
    {
      id: "8254",
      fecha: "22/12/2025 11:51",
      cliente: "Sabrina Antonucci",
      email: "sabrina.antonucci@gmail.com",
      telefono: "+54 9 11 4444 5678",
      total: "$35.550,00",
      productos: "1 unid.",
      pagoEstado: "pendiente",
      envio: "Por empaquetar (PICK UP POINT - Temperley)",
    },
  ]);

  const ventasFiltradas = ventasData.filter((venta) =>
    [venta.id, venta.cliente, venta.email, venta.telefono]
      .join(" ")
      .toLowerCase()
      .includes(busqueda.toLowerCase())
  );

  function marcarPagoRecibido(id) {
    setVentasData((prev) =>
      prev.map((v) =>
        v.id === id ? { ...v, pagoEstado: "recibido" } : v
      )
    );
  }

  return (
    <div className="admin-section">
      <h2 className="admin-section-title">
        Ventas <span className="sales-count">(5880 abiertas)</span>
      </h2>

      <p className="admin-section-text">
        Gestión diaria de pedidos, pagos y envíos.
      </p>

      {/* Buscador */}
      <input
        type="text"
        placeholder="Buscar por cliente, email, teléfono o número..."
        className="sales-search"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Venta</th>
              <th>Fecha</th>
              <th>Cliente</th>
              <th>Total</th>
              <th>Productos</th>
              <th>Pago</th>
              <th>Envío</th>
            </tr>
          </thead>

          <tbody>
            {ventasFiltradas.map((venta) => (
              <tr key={venta.id}>
                <td>
                  <Link to={`/admin/sales/${venta.id}`} className="venta-link">
                    #{venta.id}
                  </Link>
                </td>
                <td>{venta.fecha}</td>
                <td>{venta.cliente}</td>
                <td>{venta.total}</td>
                <td>{venta.productos}</td>

                <td>
                  {venta.pagoEstado === "recibido" ? (
                    <span className="payment-status paid">Recibido</span>
                  ) : (
                    <div className="payment-pending-wrapper">
                      <span className="payment-status pending">
                        No recibido
                      </span>
                      <button
                        className="mark-paid-btn"
                        onClick={() => marcarPagoRecibido(venta.id)}
                      >
                        Marcar como recibido
                      </button>
                    </div>
                  )}
                </td>

                <td>{venta.envio}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
