export default function Step1({ formData, updateField, next }) {
  const isValid =
    formData.name.trim().length > 2 &&
    formData.dni.trim().length >= 7 &&
    formData.email.trim().length > 5 &&
    formData.phone.trim().length > 5;

  return (
    <div className="checkout-step">
      <h2>Datos personales</h2>

      <div className="form-group">
        <label>Nombre completo</label>
        <input
          type="text"
          placeholder="Ej: Matías González"
          value={formData.name}
          onChange={(e) => updateField("name", e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>DNI</label>
        <input
          type="text"
          placeholder="Ej: 12345678"
          value={formData.dni}
          onChange={(e) => updateField("dni", e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Email</label>
        <input
          type="email"
          placeholder="tuemail@ejemplo.com"
          value={formData.email}
          onChange={(e) => updateField("email", e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Teléfono</label>
        <input
          type="text"
          placeholder="Ej: 11 2345 6789"
          value={formData.phone}
          onChange={(e) => updateField("phone", e.target.value)}
        />
      </div>

      <button
        className="checkout-btn"
        onClick={next}
        disabled={!isValid}
        style={{
          opacity: isValid ? 1 : 0.5,
          cursor: isValid ? "pointer" : "default",
        }}
      >
        Siguiente
      </button>
    </div>
  );
}
