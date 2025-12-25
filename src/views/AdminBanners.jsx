import { useState } from "react";
import AdminLayout from "./AdminLayout";
import "../styles/adminpanel.css";

export default function AdminBanners() {
  // ============================
  // MENSAJE DEL BANNER
  // ============================
  const [message, setMessage] = useState(
    localStorage.getItem("promoMessage") || ""
  );

  function saveMessage() {
    localStorage.setItem("promoMessage", message);
    alert("Mensaje del banner actualizado");
  }

  return (
    <AdminLayout>
      {/* HEADER */}
      <div className="admin-header">
        <h1 className="admin-title">Mensaje del Banner</h1>
        <p className="admin-welcome">
          Editá el mensaje que aparece en el slider principal
        </p>
      </div>

      {/* ============================
          EDITOR DEL MENSAJE
      ============================ */}
      <section className="admin-section">
        <h2 className="section-title">Editar mensaje</h2>

        <input
          type="text"
          className="tracking-input"
          placeholder="Nuevo mensaje del banner"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        <button className="btn-guardar" onClick={saveMessage}>
          Guardar mensaje
        </button>
      </section>

      {/* ============================
          PREVIEW EN VIVO
      ============================ */}
      <section className="admin-section">
        <h2 className="section-title">Preview</h2>

        <div className="banner-preview">
          {message || "Escribí un mensaje para ver la vista previa"}
        </div>
      </section>
    </AdminLayout>
  );
}
