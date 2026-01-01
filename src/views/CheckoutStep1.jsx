export default function Step1({ formData, updateField, next }) {
  return (
    <div className="checkout-step">
      <h2>Datos personales</h2>

      <div className="form-group">
        <label>Nombre completo</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => updateField("name", e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Email</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => updateField("email", e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Teléfono</label>
        <input
          type="text"
          value={formData.phone}
          onChange={(e) => updateField("phone", e.target.value)}
        />
      </div>

      <button className="checkout-btn" onClick={next}>
        Siguiente
      </button>
    </div>
  );
}
