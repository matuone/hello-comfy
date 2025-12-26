import { useParams, Link } from "react-router-dom";
import "../styles/admincustomerdetail.css";
import { salesData } from "../data/salesData";

export default function AdminCustomerDetail() {
  const { id } = useParams(); // id = email del cliente

  // ============================
  // OBTENER CLIENTE DESDE VENTAS
  // ============================
  const compras = salesData.filter(v => v.email === id);

  const clienteBase = compras.length
    ? {
      nombre: compras[0].cliente,
      email: compras[0].email,
      whatsapp: compras[0].telefono || "",
      dni: "",
      notas: "",
    }
    : {
      nombre: "Cliente desconocido",
      email: id,
      whatsapp: "",
      dni: "",
      notas: "",
    };

  const total = compras.reduce((acc, v) => {
    const num = Number(String(v.total).replace(/[^0-9.-]+/g, ""));
    return acc + num;
  }, 0);

  const ultimaCompra = compras.length
    ? compras.reduce((a, b) => {
      const fechaA = new Date(a.fecha);
      const fechaB = new Date(b.fecha);
      return fechaA > fechaB ? a : b;
    })
    : null;

  const cliente = {
    ...clienteBase,
    compras,
    total,
    ultimaCompra,
  };

  const ticketPromedio =
    cliente.compras.length > 0 ? cliente.total / cliente.compras.length : 0;

  return (
    <div className="admin-section">
      <h2 className="admin-section-title">Cliente {cliente.nombre}</h2>
      <p className="admin-section-text">
        Información personal, historial de compras y contacto.
      </p>

      {/* ACCIONES */}
      <div className="cliente-actions">
        <Link to="/admin/customers" className="btn-volver">
          ← Volver
        </Link>

        <Link to={`/admin/customers/${id}/edit`} className="btn-editar">
          Editar cliente
        </Link>
      </div>

      {/* DATOS PERSONALES */}
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
            <p>{cliente.dni || "—"}</p>
          </div>
        </div>
      </div>

      {/* ESTADÍSTICAS */}
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
                ? `#${cliente.ultimaCompra.id} ${cliente.ultimaCompra.fecha}`
                : "—"}
            </span>
          </div>
        </div>
      </div>

      {/* HISTORIAL DE COMPRAS */}
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
                <tr key={c.id}>
                  <td>#{c.id}</td>
                  <td>{c.fecha}</td>
                  <td>{c.total}</td>
                  <td>
                    <Link to={`/admin/sales/${c.id}`} className="btn-ver-venta">
                      Ver venta →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* CONTACTAR */}
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
