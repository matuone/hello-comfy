import { useParams, Link } from "react-router-dom";
import "../styles/admincustomerdetail.css";

export default function AdminCustomerDetail() {
  const { id } = useParams();

  // ============================
  // MOCK DE CLIENTE
  // ============================
  const cliente = {
    id,
    nombre: "María Laura Ambroggio",
    email: "mlaura@example.com",
    whatsapp: "+5491123456791",
    dni: "38.112.445",
    ultimaCompra: { nro: 7552, fecha: "06/06/2025" },
    total: 35318.74,
    compras: [
      { nro: 7552, fecha: "06/06/2025", total: 18900 },
      { nro: 7440, fecha: "04/05/2025", total: 16418.74 },
    ],
  };

  const ticketPromedio =
    cliente.compras.length > 0
      ? cliente.total / cliente.compras.length
      : 0;

  return (
    <div className="admin-section">
      <h2 className="admin-section-title">Cliente {cliente.nombre}</h2>
      <p className="admin-section-text">
        Información personal, historial de compras y contacto.
      </p>

      {/* ============================
          ACCIONES SUPERIORES
      ============================ */}
      <div className="cliente-actions">
        <Link to="/admin/customers" className="btn-volver">
          ← Volver
        </Link>

        <button className="btn-editar">Editar cliente</button>
      </div>

      {/* ============================
          DATOS PERSONALES
      ============================ */}
      <div className="detalle-box">
        <h3 className="detalle-title">Datos personales</h3>

        <div className="cliente-info-grid">
          <div>
            <label>Nombre</label>
            <p>{cliente.nombre}</p>
          </div>

          <div>
            <label>Email</label>
            <p>{cliente.email}</p>
          </div>

          <div>
            <label>WhatsApp</label>
            <p>{cliente.whatsapp}</p>
          </div>

          <div>
            <label>DNI</label>
            <p>{cliente.dni}</p>
          </div>
        </div>
      </div>

      {/* ============================
          ESTADÍSTICAS
      ============================ */}
      <div className="detalle-box">
        <h3 className="detalle-title">Estadísticas</h3>

        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-label">Total consumido</span>
            <span className="stat-value">
              ${cliente.total.toLocaleString("es-AR")}
            </span>
          </div>

          <div className="stat-item">
            <span className="stat-label">Compras totales</span>
            <span className="stat-value">{cliente.compras.length}</span>
          </div>

          <div className="stat-item">
            <span className="stat-label">Ticket promedio</span>
            <span className="stat-value">
              ${ticketPromedio.toLocaleString("es-AR", {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>

          <div className="stat-item">
            <span className="stat-label">Última compra</span>
            <span className="stat-value">
              {cliente.ultimaCompra
                ? `#${cliente.ultimaCompra.nro} ${cliente.ultimaCompra.fecha}`
                : "—"}
            </span>
          </div>
        </div>
      </div>

      {/* ============================
          HISTORIAL DE COMPRAS
      ============================ */}
      <div className="detalle-box">
        <h3 className="detalle-title">Historial de compras</h3>

        {cliente.compras.length === 0 ? (
          <p>Este cliente no tiene compras registradas.</p>
        ) : (
          <table className="cliente-compras-table">
            <thead>
              <tr>
                <th>N° Orden</th>
                <th>Fecha</th>
                <th>Total</th>
                <th>Ver</th>
              </tr>
            </thead>
            <tbody>
              {cliente.compras.map((c) => (
                <tr key={c.nro}>
                  <td>#{c.nro}</td>
                  <td>{c.fecha}</td>
                  <td>${c.total.toLocaleString("es-AR")}</td>
                  <td>
                    <Link
                      to={`/admin/sales/${c.nro}`}
                      className="btn-ver-venta"
                    >
                      Ver venta →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ============================
          CONTACTAR
      ============================ */}
      <div className="detalle-box">
        <h3 className="detalle-title">Contactar</h3>

        <div className="contact-buttons">
          <a href={`mailto:${cliente.email}`} className="btn-contact email">
            📧 Enviar email
          </a>

          <a
            href={`https://wa.me/${cliente.whatsapp}`}
            target="_blank"
            rel="noreferrer"
            className="btn-contact whatsapp"
          >
            💬 WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
