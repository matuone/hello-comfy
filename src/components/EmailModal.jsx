import { useState } from "react";
import "../styles/admin/emailmodal.css";

export default function EmailModal({ customerEmail, customerName, onClose }) {
  const [form, setForm] = useState({
    tema: "",
    email: customerEmail,
    whatsapp: "",
    descripcion: "",
  });

  const [status, setStatus] = useState(null);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("loading");

    // Validación de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setStatus("error");
      alert("Ingresá un email válido");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tema: form.tema,
          email: form.email,
          whatsapp: form.whatsapp,
          descripcion: form.descripcion,
          orden: "",
        }),
      });

      if (res.ok) {
        setStatus("success");
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setStatus("error");
      }
    } catch (err) {
      setStatus("error");
    }
  }

  return (
    <div className="email-modal-overlay" onClick={onClose}>
      <div className="email-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="email-modal-header">
          <h2>Enviar email a {customerName}</h2>
          <button className="email-modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <form className="email-form" onSubmit={handleSubmit}>
          <input
            className="email-input"
            type="text"
            name="tema"
            placeholder="Tema del email"
            value={form.tema}
            onChange={handleChange}
            required
          />

          <input
            className="email-input"
            type="email"
            name="email"
            placeholder="Email de respuesta"
            value={form.email}
            onChange={handleChange}
            required
            pattern="^[^\s@]+@[^\s@]+\.[^\s@]+$"
          />

          <input
            className="email-input"
            type="text"
            name="whatsapp"
            placeholder="WhatsApp (opcional)"
            value={form.whatsapp}
            onChange={handleChange}
          />

          <textarea
            className="email-textarea"
            name="descripcion"
            placeholder="Mensaje"
            rows="6"
            value={form.descripcion}
            onChange={handleChange}
            required
          />

          <button
            className="email-button"
            type="submit"
            disabled={status === "loading"}
          >
            {status === "loading" ? "Enviando..." : "Enviar"}
          </button>

          {status === "success" && (
            <p className="email-success">✅ Email enviado con éxito</p>
          )}

          {status === "error" && (
            <p className="email-error">❌ Error al enviar el email</p>
          )}
        </form>
      </div>
    </div>
  );
}
