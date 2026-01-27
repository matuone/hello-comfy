import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import "../styles/admincustomerdetail.css";
import EmailModal from "../components/EmailModal";

export default function AdminCustomerDetail() {
  const { id } = useParams(); // id = email del cliente
  const navigate = useNavigate();
  const [cliente, setCliente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Cargar cliente de MongoDB
  useEffect(() => {
    const fetchCliente = async () => {
      try {
        setLoading(true);
        const res = await fetch(`http://localhost:5000/api/customers/${id}`);
        if (!res.ok) {
          throw new Error("Cliente no encontrado");
        }
        const data = await res.json();
        setCliente(data);
        setError(null);
      } catch (err) {
        console.error("Error al cargar cliente:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCliente();
  }, [id]);

  if (loading) {
    return (
      <div className="admin-section">
        <h2 className="admin-section-title">Cliente</h2>
        <p className="admin-section-text">Cargando...</p>
      </div>
    );
  }

  if (error || !cliente) {
    return (
      <div className="admin-section">
        <h2 className="admin-section-title">Cliente</h2>
        <p className="admin-section-text" style={{ color: "red" }}>
          {error || "Cliente no encontrado"}
        </p>
        <Link to="/admin/customers" className="btn-volver">
          ← Volver
        </Link>
      </div>
    );
  }

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
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            className="btn-contact eliminar"
            onClick={() => setShowDeleteModal(true)}
            disabled={deleting}
          >
            🗑️ Eliminar cliente
          </button>
          <Link to={`/admin/customers/${id}/edit`} className="btn-editar">
            Editar cliente
          </Link>
        </div>
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
            <p>{cliente.whatsapp || "—"}</p>
          </div>

          <div>
            <label>Teléfono</label>
            <p>{cliente.telefono || "—"}</p>
          </div>

          <div>
            <label>Ciudad</label>
            <p>{cliente.ciudad || "—"}</p>
          </div>

          <div>
            <label>Código Postal</label>
            <p>{cliente.codigoPostal || "—"}</p>
          </div>
        </div>
      </div>

      {/* ESTADÍSTICAS */}
      <div className="detalle-box">
        <h3 className="detalle-title">Información adicional</h3>

        <div className="info-section">
          <label>Dirección</label>
          <p>{cliente.direccion || "—"}</p>
        </div>

        <div className="info-section">
          <label>Notas</label>
          <p>{cliente.notas || "Sin notas"}</p>
        </div>

        <div className="info-section">
          <label>Estado</label>
          <p>
            <span className={`status-badge status-${cliente.estado}`}>
              {cliente.estado === "activo" ? "Activo" : "Inactivo"}
            </span>
          </p>
        </div>
      </div>

      {/* CONTACTAR */}
      <div className="detalle-box">
        <h3 className="detalle-title">Contactar cliente</h3>
        <div className="contact-buttons">
          <button
            className="btn-contact email"
            onClick={() => setShowEmailModal(true)}
            disabled={!cliente.email}
          >
            📧 Enviar email
          </button>
          <a
            href={`https://wa.me/${cliente.whatsapp.replace(/\D/g, "")}`}
            target="_blank"
            rel="noreferrer"
            className="btn-contact whatsapp"
            disabled={!cliente.whatsapp}
          >
            💬 WhatsApp
          </a>
        </div>
      </div>

      {/* Modal comfy para eliminar cliente */}
      {showDeleteModal && (
        <div className="comfy-modal-backdrop">
          <div className="comfy-modal">
            <div className="modal-icon">🗑️</div>
            <div className="modal-message">
              ¿Seguro que querés eliminar este cliente?<br />
              <span style={{ color: '#d32f2f', fontWeight: 700 }}>{cliente.nombre}</span>
              <br />Esta acción no se puede deshacer.
            </div>
            <div className="comfy-modal-buttons">
              <button
                className="btn-contact eliminar"
                onClick={async () => {
                  setDeleting(true);
                  try {
                    const res = await fetch(`http://localhost:5000/api/customers/${encodeURIComponent(cliente.email)}`, { method: 'DELETE' });
                    if (res.ok) {
                      navigate('/admin/customers');
                    } else {
                      alert('Error al eliminar cliente');
                    }
                  } catch (e) {
                    alert('Error al eliminar cliente');
                  } finally {
                    setDeleting(false);
                  }
                }}
                disabled={deleting}
              >
                Sí, eliminar
              </button>
              <button
                className="btn-contact"
                style={{ background: '#eee', color: '#444' }}
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Modal */}
      {showEmailModal && (
        <EmailModal
          customerEmail={cliente.email}
          customerName={cliente.nombre}
          onClose={() => setShowEmailModal(false)}
        />
      )}
    </div>
  );
}
