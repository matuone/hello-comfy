import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/register.css";


export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    dni: "",
    whatsapp: "",
    birthdate: "",
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

    if (form.password !== form.confirmPassword) {
      setError("Las contraseñas no coinciden");
      setLoading(false);
      return;
    }

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

        <div className="password-input-wrapper">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Contraseña"
            value={form.password}
            onChange={handleChange}
            required
          />
          <button
            type="button"
            className="toggle-password"
            onClick={() => setShowPassword(!showPassword)}
            aria-label="Mostrar contraseña"
          >
            {showPassword ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            )}
          </button>
        </div>

        <div className="password-input-wrapper">
          <input
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            placeholder="Confirmar contraseña"
            value={form.confirmPassword}
            onChange={handleChange}
            required
          />
          <button
            type="button"
            className="toggle-password"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            aria-label="Mostrar confirmar contraseña"
          >
            {showConfirmPassword ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            )}
          </button>
        </div>



        <input
          type={form.birthdate ? "date" : "text"}
          name="birthdate"
          placeholder="Fecha de nacimiento"
          value={form.birthdate}
          onFocus={e => e.target.type = 'date'}
          onBlur={e => { if (!e.target.value) e.target.type = 'text'; }}
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
