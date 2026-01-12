import { useState } from "react";

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

    try {
      const res = await fetch("http://localhost:5000/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setForm({
          tema: "",
          orden: "",
          email: "",
          whatsapp: "",
          descripcion: "",
        });
      } else {
        setStatus("error");
      }
    } catch (err) {
      setStatus("error");
    }
  }

  return (
    <div>
      <h2>Centro de ayuda</h2>
      <p>Completá el formulario y nos pondremos en contacto.</p>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "500px" }}>

        <input
          type="text"
          name="tema"
          placeholder="Tema"
          value={form.tema}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="orden"
          placeholder="Orden de venta (opcional)"
          value={form.orden}
          onChange={handleChange}
        />

        <input
          type="email"
          name="email"
          placeholder="Tu email"
          value={form.email}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="whatsapp"
          placeholder="Número de WhatsApp"
          value={form.whatsapp}
          onChange={handleChange}
          required
        />

        <textarea
          name="descripcion"
          placeholder="Describí tu problema"
          rows="5"
          value={form.descripcion}
          onChange={handleChange}
          required
        />

        <button type="submit">Enviar</button>

        {status === "loading" && <p>Enviando...</p>}
        {status === "success" && <p style={{ color: "green" }}>Mensaje enviado con éxito</p>}
        {status === "error" && <p style={{ color: "red" }}>Error al enviar el mensaje</p>}
      </form>
    </div>
  );
}
