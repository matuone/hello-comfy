import { useState } from "react";
import "../../styles/account/accounthelp.css";

export default function AccountHelp() {
  const [form, setForm] = useState({
    tema: "",
    orden: "",
    email: "",
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

    // Validación de WhatsApp (opcional)
    const phoneRegex = /^[0-9+\-\s()]{6,20}$/;
    if (form.whatsapp && !phoneRegex.test(form.whatsapp)) {
      setStatus("error");
      alert("Ingresá un número de WhatsApp válido");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setStatus("success");
        setForm({
          tema: "",
          orden: "",
          email: "",
          whatsapp: "",
          descripcion: "",
        });

        setTimeout(() => setStatus(null), 3000);
      } else {
        setStatus("error");
      }
    } catch (err) {
      setStatus("error");
    }
  }

  return (
    <div>
      <h2 className="help-title">Centro de ayuda</h2>
      <p className="help-subtitle">
        Completá el formulario y nos pondremos en contacto.
      </p>

      <form className="help-form" onSubmit={handleSubmit}>
        <input
          className="help-input"
          type="text"
          name="tema"
          placeholder="Tema"
          value={form.tema}
          onChange={handleChange}
          required
        />

        <input
          className="help-input"
          type="text"
          name="orden"
          placeholder="Orden de venta (opcional)"
          value={form.orden}
          onChange={handleChange}
        />

        <input
          className="help-input"
          type="email"
          name="email"
          placeholder="Tu email"
          value={form.email}
          onChange={handleChange}
          required
          pattern="^[^\s@]+@[^\s@]+\.[^\s@]+$"
        />

        <input
          className="help-input"
          type="text"
          name="whatsapp"
          placeholder="+54 9 11 2233 4455"
          value={form.whatsapp}
          onChange={handleChange}
          pattern="[0-9+\-\s()]{6,20}"
        />

        <textarea
          className="help-textarea"
          name="descripcion"
          placeholder="Describí tu problema"
          rows="5"
          value={form.descripcion}
          onChange={handleChange}
          required
        />

        <button
          className="help-button"
          type="submit"
          disabled={status === "loading"}
        >
          {status === "loading" ? "Enviando..." : "Enviar"}
        </button>

        {status === "success" && (
          <p className="help-success">Mensaje enviado con éxito</p>
        )}

        {status === "error" && (
          <p className="help-error">Hubo un error al enviar el mensaje</p>
        )}
      </form>
    </div>
  );
}
