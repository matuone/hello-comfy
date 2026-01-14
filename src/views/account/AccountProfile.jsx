import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import "../../styles/account/accountprofile.css";

export default function AccountProfile() {
  const { user, token, logout } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
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
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ============================
  // CARGAR DATOS DEL USUARIO
  // ============================
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        dni: user.dni || "",
        whatsapp: user.whatsapp || "",
        address: {
          street: user.address?.street || "",
          number: user.address?.number || "",
          floor: user.address?.floor || "",
          city: user.address?.city || "",
          province: user.address?.province || "",
          postalCode: user.address?.postalCode || "",
        },
      });
    }
  }, [user]);

  // ============================
  // MANEJO DE CAMBIOS
  // ============================
  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
    setMessage("");
  }

  function handleAddressChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        [name]: value,
      },
    }));
    setError("");
    setMessage("");
  }

  // ============================
  // ENVIAR FORMULARIO
  // ============================
  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      // Validar campos requeridos
      if (
        !formData.name ||
        !formData.dni ||
        !formData.whatsapp ||
        !formData.address.street ||
        !formData.address.number ||
        !formData.address.city ||
        !formData.address.province ||
        !formData.address.postalCode
      ) {
        setError("Por favor completa todos los campos requeridos");
        setLoading(false);
        return;
      }

      // Enviar PUT a /api/users/{userId}
      const res = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error al actualizar el perfil");
        setLoading(false);
        return;
      }

      // Actualizar el usuario en el contexto
      const updatedUser = {
        ...user,
        name: data.user.name,
        dni: data.user.dni,
        whatsapp: data.user.whatsapp,
        address: data.user.address,
      };

      // Guardar en localStorage
      localStorage.setItem("authUser", JSON.stringify(updatedUser));

      setMessage("✓ Perfil actualizado correctamente");
      setLoading(false);
    } catch (err) {
      console.error("Error:", err);
      setError("Error de conexión. Intenta de nuevo.");
      setLoading(false);
    }
  }

  if (!user) {
    return <div className="profile-container">Cargando...</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h1>Mi Perfil</h1>

        {error && <div className="profile-error">{error}</div>}
        {message && <div className="profile-success">{message}</div>}

        <form onSubmit={handleSubmit} className="profile-form">
          {/* SECCIÓN 1: DATOS PERSONALES */}
          <div className="form-section">
            <h2>Datos Personales</h2>

            <div className="form-group">
              <label htmlFor="name">Nombre *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Tu nombre completo"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email (no editable) *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                readOnly
                disabled
                placeholder="tu@email.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="dni">DNI/Cédula *</label>
              <input
                type="text"
                id="dni"
                name="dni"
                value={formData.dni}
                onChange={handleChange}
                required
                placeholder="12.345.678"
              />
            </div>

            <div className="form-group">
              <label htmlFor="whatsapp">WhatsApp *</label>
              <input
                type="tel"
                id="whatsapp"
                name="whatsapp"
                value={formData.whatsapp}
                onChange={handleChange}
                required
                placeholder="+54 9 11 1234-5678"
              />
            </div>
          </div>

          {/* SECCIÓN 2: DIRECCIÓN */}
          <div className="form-section">
            <h2>Dirección de Envío</h2>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="street">Calle *</label>
                <input
                  type="text"
                  id="street"
                  name="street"
                  value={formData.address.street}
                  onChange={handleAddressChange}
                  required
                  placeholder="Ej: Avenida Principal"
                />
              </div>

              <div className="form-group">
                <label htmlFor="number">Número *</label>
                <input
                  type="text"
                  id="number"
                  name="number"
                  value={formData.address.number}
                  onChange={handleAddressChange}
                  required
                  placeholder="Ej: 123"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="floor">Piso/Depto (opcional)</label>
              <input
                type="text"
                id="floor"
                name="floor"
                value={formData.address.floor}
                onChange={handleAddressChange}
                placeholder="Ej: 5B"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="city">Ciudad *</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.address.city}
                  onChange={handleAddressChange}
                  required
                  placeholder="Ej: Buenos Aires"
                />
              </div>

              <div className="form-group">
                <label htmlFor="province">Provincia/Estado *</label>
                <input
                  type="text"
                  id="province"
                  name="province"
                  value={formData.address.province}
                  onChange={handleAddressChange}
                  required
                  placeholder="Ej: Buenos Aires"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="postalCode">Código Postal *</label>
              <input
                type="text"
                id="postalCode"
                name="postalCode"
                value={formData.address.postalCode}
                onChange={handleAddressChange}
                required
                placeholder="Ej: 1425"
              />
            </div>
          </div>

          {/* BOTÓN SUBMIT */}
          <button type="submit" className="btn-save" disabled={loading}>
            {loading ? "Guardando..." : "Guardar Cambios"}
          </button>
        </form>
      </div>
    </div>
  );
}
