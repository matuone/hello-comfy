import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import "../../styles/account/accountprofile.css";

export default function AccountProfile() {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    name: "",
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

  // ============================
  // CARGAR DATOS DEL USUARIO
  // ============================
  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        dni: user.dni || "",
        whatsapp: user.whatsapp || "",
        address: user.address || {
          street: "",
          number: "",
          floor: "",
          city: "",
          province: "",
          postalCode: "",
        },
      });
    }
  }, [user]);

  // ============================
  // MANEJAR CAMBIOS DE INPUTS
  // ============================
  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  // ============================
  // MANEJAR CAMBIOS DE DIRECCIÓN
  // ============================
  function handleAddressChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        [name]: value,
      },
    }));
  }

  // ============================
  // ENVIAR ACTUALIZACIÓN
  // ============================
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error al actualizar el perfil");
        setLoading(false);
        return;
      }

      setSuccess("Perfil actualizado correctamente");
      setLoading(false);
    } catch (err) {
      console.error("Error:", err);
      setError("Error al conectar con el servidor");
      setLoading(false);
    }
  }

  return (
    <div className="account-profile">
      <h2>Mi Perfil</h2>

      <form onSubmit={handleSubmit} className="profile-form">
        {/* EMAIL (SOLO LECTURA) */}
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={user?.email || ""}
            disabled
            className="form-input disabled"
          />
          <small>No se puede cambiar el email</small>
        </div>

        {/* NOMBRE */}
        <div className="form-group">
          <label>Nombre completo</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="form-input"
            required
          />
        </div>

        {/* DNI */}
        <div className="form-group">
          <label>DNI</label>
          <input
            type="text"
            name="dni"
            value={form.dni}
            onChange={handleChange}
            className="form-input"
            placeholder="Ej: 12345678"
          />
        </div>

        {/* WHATSAPP */}
        <div className="form-group">
          <label>WhatsApp</label>
          <input
            type="text"
            name="whatsapp"
            value={form.whatsapp}
            onChange={handleChange}
            className="form-input"
            placeholder="Ej: +5491234567890"
          />
        </div>

        {/* DIRECCIÓN */}
        <fieldset className="address-fieldset">
          <legend>Dirección</legend>

          <div className="form-row">
            <div className="form-group">
              <label>Calle</label>
              <input
                type="text"
                name="street"
                value={form.address.street}
                onChange={handleAddressChange}
                className="form-input"
                placeholder="Ej: Avenida Corrientes"
              />
            </div>

            <div className="form-group">
              <label>Número</label>
              <input
                type="text"
                name="number"
                value={form.address.number}
                onChange={handleAddressChange}
                className="form-input"
                placeholder="Ej: 1234"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Piso/Depto (opcional)</label>
              <input
                type="text"
                name="floor"
                value={form.address.floor}
                onChange={handleAddressChange}
                className="form-input"
                placeholder="Ej: 5 B"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Ciudad</label>
              <input
                type="text"
                name="city"
                value={form.address.city}
                onChange={handleAddressChange}
                className="form-input"
                placeholder="Ej: Buenos Aires"
              />
            </div>

            <div className="form-group">
              <label>Provincia</label>
              <input
                type="text"
                name="province"
                value={form.address.province}
                onChange={handleAddressChange}
                className="form-input"
                placeholder="Ej: Buenos Aires"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Código Postal</label>
              <input
                type="text"
                name="postalCode"
                value={form.address.postalCode}
                onChange={handleAddressChange}
                className="form-input"
                placeholder="Ej: 1425"
              />
            </div>
          </div>
        </fieldset>

        {/* MENSAJES DE ERROR/ÉXITO */}
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {/* BOTÓN ENVIAR */}
        <button
          type="submit"
          className="profile-btn"
          disabled={loading}
        >
          {loading ? "Guardando..." : "Guardar cambios"}
        </button>
      </form>
    </div>
  );
}
