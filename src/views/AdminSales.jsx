// src/views/AdminSales.jsx
import { useState } from "react";

export default function AdminSales() {
  const [filtroEstado, setFiltroEstado] = useState("todos");

  const ventas = [
    {
      id: "#8256",
      fecha: "23/12/2025 15:10",
      cliente: "Camila Cabrera Iglesias",
      total: "$60.361,74",
      productos: "1 unid.",
      pago: "Recibido",
      envio: "Enviada (Andreani Estándar)",
    },
    {
      id: "#8255",
      fecha: "22/12/2025 20:37",
      cliente: "Carolina Raggetti",
      total: "$35.550,00",
      productos: "1 unid.",
      pago: "Recibido",
      envio: "Por empaquetar (Andreani Online - Showroom)",
    },
    {
      id: "#8254",
      fecha: "22/12/2025 11:51",
      cliente: "Sabrina Antonucci",
      total: "$35.550,00",
      productos: "1 unid.",
      pago: "Recibido",
      envio: "Por empaquetar (PICK UP POINT - Temperley)",
    },
  ];

  return (
    <div className="admin-section">
      <h2 className="admin-section-title">
        Ventas <span className="sales-count">(5880 abiertas)</span>
      </h2>

      <p className="admin-section-text">
        Gestión diaria de pedidos, pagos y envíos.
      </p>

      {/* ============================
          BOTONES DE FILTRO
      ============================ */}
      <div className="sales-filters">
        {[
          "Por cobrar",
          "Por empaquetar",
          "Por enviar",
          "Por retirar",
          "Por archivar",
        ].map((label) => (
          <button
            key={label}
            className={`sales-filter-btn${filtroEstado === label ? " active" : ""
              }`}
            onClick={() => setFiltroEstado(label)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ============================
          TABLA
      ============================ */}
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
            {ventas.map((venta) => (
              <tr key={venta.id}>
                <td>{venta.id}</td>
                <td>{venta.fecha}</td>
                <td>{venta.cliente}</td>
                <td>{venta.total}</td>
                <td>{venta.productos}</td>
                <td>
                  <span className="payment-status paid">{venta.pago}</span>
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
