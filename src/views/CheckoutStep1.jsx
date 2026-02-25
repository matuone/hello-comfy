import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

// Formatear teléfono argentino: +54 9 XX XXXX XXXX
function formatPhoneAR(value) {
  // Extraer solo dígitos
  let digits = value.replace(/\D/g, "");

  // Si empieza con 54, removerlo (lo agregamos nosotros)
  if (digits.startsWith("549")) digits = digits.slice(3);
  else if (digits.startsWith("54")) digits = digits.slice(2);

  // Limitar a 10 dígitos (código de área + número)
  digits = digits.slice(0, 10);

  // Armar formato +54 9 XX XXXX XXXX
  if (digits.length === 0) return "+54 9 ";
  if (digits.length <= 2) return `+54 9 ${digits}`;
  if (digits.length <= 6) return `+54 9 ${digits.slice(0, 2)} ${digits.slice(2)}`;
  return `+54 9 ${digits.slice(0, 2)} ${digits.slice(2, 6)} ${digits.slice(6)}`;
}

function isPhoneValid(phone) {
  const digits = (phone || "").replace(/\D/g, "");
  // 54 + 9 + 10 dígitos = 13 dígitos totales, o solo los 10 del número
  return digits.length === 13 || (digits.length === 10 && !phone.startsWith("+"));
}

export default function Step1({ formData, updateField, next }) {
  const { user } = useContext(AuthContext);
  const isLoggedIn = !!user;

  // Inicializar phone con prefijo si está vacío
  const phoneValue = formData.phone || "+54 9 ";
  const phoneDigits = phoneValue.replace(/\D/g, "");

  const isValid =
    (formData.name || "").trim().length > 2 &&
    (formData.dni || "").trim().length >= 7 &&
    (formData.email || "").trim().length > 5 &&
    phoneDigits.length === 13;

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
          value={formData.dni || ""}
          onChange={(e) => updateField("dni", e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Email {isLoggedIn && "(Desde tu cuenta)"}</label>
        <input
          type="email"
          placeholder="tuemail@ejemplo.com"
          value={formData.email}
          onChange={(e) => updateField("email", e.target.value)}
          disabled={isLoggedIn}
          style={{
            backgroundColor: isLoggedIn ? "#f5f5f5" : "white",
            cursor: isLoggedIn ? "not-allowed" : "text",
            opacity: isLoggedIn ? 0.7 : 1,
          }}
        />
        {isLoggedIn && (
          <small style={{ color: '#888', fontSize: '0.85rem', marginTop: '4px', display: 'block' }}>
            No puedes cambiar el email de tu cuenta durante el checkout
          </small>
        )}
      </div>

      <div className="form-group">
        <label>Teléfono (WhatsApp)</label>
        <input
          type="tel"
          placeholder="+54 9 11 2345 6789"
          value={phoneValue}
          onChange={(e) => {
            const formatted = formatPhoneAR(e.target.value);
            updateField("phone", formatted);
          }}
          onFocus={(e) => {
            // Si está vacío, poner el prefijo
            if (!formData.phone) updateField("phone", "+54 9 ");
          }}
          onKeyDown={(e) => {
            // Prevenir borrar el prefijo "+54 9 "
            if (e.key === "Backspace" && (phoneValue === "+54 9 " || phoneValue.length <= 6)) {
              e.preventDefault();
            }
          }}
        />
        {phoneDigits.length > 3 && phoneDigits.length < 13 && (
          <small style={{ color: '#d94f7a', fontSize: '0.85rem', marginTop: '4px', display: 'block' }}>
            Faltan {13 - phoneDigits.length} dígitos — Formato: +54 9 [cód. área] [número]
          </small>
        )}
        {phoneDigits.length === 13 && (
          <small style={{ color: '#4caf50', fontSize: '0.85rem', marginTop: '4px', display: 'block' }}>
            ✓ Número válido
          </small>
        )}
        {phoneDigits.length <= 3 && (
          <small style={{ color: '#888', fontSize: '0.85rem', marginTop: '4px', display: 'block' }}>
            Formato: +54 9 [código de área] [número]
          </small>
        )}
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
