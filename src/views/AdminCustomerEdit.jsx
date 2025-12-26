import { useParams, Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import "../styles/admincustomeredit.css";

export default function AdminCustomerEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  // ============================
  // MOCK DEL CLIENTE A EDITAR
  // ============================
  const clienteOriginal = {
    id,
    nombre: "María Laura Ambroggio",
    email: "mlaura@example.com",
    whatsapp: "+5491123456791",
    dni: "38.112.445",
    notas: "Cliente frecuente. Prefiere contacto por WhatsApp.",
  };

  const [cliente, setCliente] = useState(clienteOriginal);

  function actualizarCampo(campo, valor) {
    setCliente(prev => ({ ...prev, [campo]: valor }));
  }

  function guardarCambios() {
    if (!cliente.nombre.trim()) {
      alert("El nombre es obligatorio.");
      return;
    }

    if (!cliente.email.trim()) {
      alert("El email es obligatorio.");
      return;
    }

    alert("Cambios guardados correctamente (mock).");
    navigate(`/admin/customers/${id}`);
  }

  return (
    <div className="admin-section">
      <h2 className="admin-section-title">Editar cliente</h2>
      <p className="admin-section-text">
        Modificá los datos personales y notas internas.
      </p>

      {/* ============================
          ACCIONES SUPERIORES
      ============================ */}
      <div className="cliente-edit-actions">
        <Link to={`/admin/customers/${id}`} className="btn-volver">
          ← Cancelar
        </Link>

        <button className="btn-guardar" onClick={guardarCambios}>
          Guardar cambios
        </button>
      </div>

      {/* ============================
          FORMULARIO
      ============================ */}
      <div className="edit-box">
        <div className="edit-grid">

          <div className="edit-item">
            <label>Nombre completo</label>
            <input
              type="text"
              value={cliente.nombre}
              onChange={e => actualizarCampo("nombre", e.target.value)}
            />
          </div>

          <div className="edit-item">
            <label>Email</label>
            <input
              type="email"
              value={cliente.email}
              onChange={e => actualizarCampo("email", e.target.value)}
            />
          </div>

          <div className="edit-item">
            <label>WhatsApp</label>
            <input
              type="text"
              value={cliente.whatsapp}
              onChange={e => actualizarCampo("whatsapp", e.target.value)}
            />
          </div>

          <div className="edit-item">
            <label>DNI</label>
            <input
              type="text"
              value={cliente.dni}
              onChange={e => actualizarCampo("dni", e.target.value)}
            />
          </div>

        </div>

        <div className="edit-item">
          <label>Notas internas</label>
          <textarea
            rows="4"
            value={cliente.notas}
            onChange={e => actualizarCampo("notas", e.target.value)}
          ></textarea>
        </div>
      </div>
    </div>
  );
}
