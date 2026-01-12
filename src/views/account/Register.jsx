import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/register.css";


export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    dni: "",
    whatsapp: "",
    address: {
      street: "",
      number: "",
      floor: "",
      city: "",
      province: "",
      postalCode: "",
    },
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;

    if (name.startsWith("address.")) {
      const field = name.split(".")[1];
      setForm((prev) => ({
        ...prev,
        address: { ...prev.address, [field]: value },
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error al crear la cuenta");
        setLoading(false);
        return;
      }

      // Registro exitoso → redirigir al login
      navigate("/mi-cuenta");
    } catch (err) {
      console.error("Error en registro:", err);
      setError("Error interno del servidor");
      setLoading(false);
    }
  }

  return (
    <div className="register-container">
      <h2>Crear cuenta</h2>

      <form className="register-form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Nombre completo"
          value={form.name}
          onChange={handleChange}
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          value={form.password}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="dni"
          placeholder="DNI"
          value={form.dni}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="whatsapp"
          placeholder="WhatsApp"
          value={form.whatsapp}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="address.street"
          placeholder="Calle"
          value={form.address.street}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="address.number"
          placeholder="Número"
          value={form.address.number}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="address.floor"
          placeholder="Piso / Depto (opcional)"
          value={form.address.floor}
          onChange={handleChange}
        />

        <input
          type="text"
          name="address.city"
          placeholder="Ciudad"
          value={form.address.city}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="address.province"
          placeholder="Provincia"
          value={form.address.province}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="address.postalCode"
          placeholder="Código postal"
          value={form.address.postalCode}
          onChange={handleChange}
          required
        />

        {error && <p className="register-error">{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Creando cuenta..." : "Crear cuenta"}
        </button>
      </form>
    </div>
  );
}
