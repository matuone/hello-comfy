import { useState, useEffect } from "react";
import "../styles/admincustomers.css";
import { Link } from "react-router-dom";

// Función para formatear número de WhatsApp (sin caracteres especiales)
function formatWhatsAppNumber(phone) {
  if (!phone) return null;
  // Elimina espacios, guiones, paréntesis, +
  const clean = phone.replace(/\D/g, '');
  // Si es Argentina y no empieza con 54, agrega el código de país
  if (clean.length === 10) {
    return `54${clean}`; // Argentina
  }
  if (clean.startsWith('9') && clean.length === 10) {
    return `54${clean}`;
  }
  return clean;
}

export default function AdminCustomers() {
  const [busqueda, setBusqueda] = useState("");
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar clientes de MongoDB + compradores sin registrarse
  useEffect(() => {
    const fetchClientes = async () => {
      try {
        setLoading(true);
        const res = await fetch("http://localhost:5000/api/customers/all-buyers");
        const data = await res.json();
        setClientes(Array.isArray(data) ? data : []);
        setError(null);
      } catch (err) {
        console.error("Error al cargar clientes:", err);
        setError("Error al cargar clientes");
        setClientes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchClientes();
  }, []);

  const filtrados = clientes.filter((c) => {
    const texto = busqueda.toLowerCase();
    return (
      c.nombre.toLowerCase().includes(texto) ||
      c.email.toLowerCase().includes(texto)
    );
  });

  if (loading) {
    return (
      <div className="admin-section">
        <h2 className="admin-section-title">Clientes</h2>
        <p className="admin-section-text">Cargando clientes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-section">
        <h2 className="admin-section-title">Clientes</h2>
        <p className="admin-section-text" style={{ color: "red" }}>
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="admin-section">
      <h2 className="admin-section-title">Clientes</h2>
      <p className="admin-section-text">
        Historial de compras, contacto y consumo total.
      </p>

      <input
        type="text"
        className="clientes-search"
        placeholder="Buscar por nombre o email..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />

      <div className="clientes-table-container">
        <table className="clientes-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>WhatsApp</th>
              <th>Teléfono</th>
              <th>Estado</th>
              <th>Ver</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map((c) => (
              <tr key={c._id}>
                <td>{c.nombre}</td>
                <td>{c.email}</td>
                <td>
                  {(c.whatsapp || c.address?.whatsapp || c.telefono) ? (
                    <a
                      href={`https://wa.me/${formatWhatsAppNumber(c.whatsapp || c.address?.whatsapp || c.telefono)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="whatsapp-link"
                    >
                      {c.whatsapp || c.address?.whatsapp || c.telefono}
                    </a>
                  ) : (
                    "—"
                  )}
                </td>
                <td>{c.telefono || "—"}</td>
                <td>
                  <span className={`status-badge status-${c.estado}`}>
                    {c.estado === "activo" ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td>
                  <Link to={`/admin/customers/${encodeURIComponent(c.email)}`} className="btn-ver-venta">
                    Ver cliente →
                  </Link>
                </td>
              </tr>
            ))}

            {filtrados.length === 0 && (
              <tr>
                <td colSpan="6" className="clientes-empty">
                  No se encontraron clientes con los filtros aplicados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
