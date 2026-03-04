// src/components/ShippingOptions.jsx
import { useState, useEffect } from "react";
import { fetchAgenciesByCP } from "../services/shippingApi";
import "../styles/shippingoptions.css";

// ============================
//  Helpers: fechas hábiles
// ============================
function addBusinessDays(date, days) {
  let count = 0;
  const current = new Date(date);
  while (count < days) {
    current.setDate(current.getDate() + 1);
    const day = current.getDay();
    if (day !== 0 && day !== 6) count++; // omitir sábado y domingo
  }
  return current;
}

const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

function formatFecha(date) {
  const dia = DIAS[date.getDay()];
  const num = String(date.getDate()).padStart(2, "0");
  const mes = String(date.getMonth() + 1).padStart(2, "0");
  return `${dia} ${num}/${mes}`;
}

function calcRangoEntrega(min, max) {
  if (!min || !max) return null;
  const hoy = new Date();
  const fechaMin = addBusinessDays(hoy, min);
  const fechaMax = addBusinessDays(hoy, max);
  return `Llega entre el ${formatFecha(fechaMin)} y el ${formatFecha(fechaMax)}`;
}

export default function ShippingOptions({ result, selected, onSelect, postalCode, initialAgency, freeShipping }) {
  if (!result) return null;

  const { correo } = result;

  const options = [
    {
      id: "correo-branch",
      carrier: "Correo Argentino",
      type: "Retiro en sucursal",
      data: correo?.branch,
    },
    {
      id: "correo-home",
      carrier: "Correo Argentino",
      type: "Envío a domicilio",
      data: correo?.home,
    },
  ];

  const available = options.filter((o) => o.data?.available);

  // Estado de sucursales
  const [agencies, setAgencies] = useState([]);
  const [loadingAgencies, setLoadingAgencies] = useState(false);
  const [selectedAgency, setSelectedAgency] = useState(null);

  // Cuando se selecciona "correo-branch", cargar sucursales
  useEffect(() => {
    if (selected === "correo-branch" && postalCode) {
      setLoadingAgencies(true);
      fetchAgenciesByCP(postalCode)
        .then((data) => {
          setAgencies(data);
          // Restaurar sucursal guardada si existe
          if (initialAgency?.code) {
            const match = data.find((a) => a.code === initialAgency.code);
            if (match) { setSelectedAgency(match); return; }
          }
          // Si hay solo una, autoseleccionarla
          if (data.length === 1) setSelectedAgency(data[0]);
        })
        .finally(() => setLoadingAgencies(false));
    }
  }, [selected, postalCode]);

  const handleSelect = (id, opt) => {
    // Si deselecciona branch, limpiar sucursal
    if (id !== "correo-branch") {
      setSelectedAgency(null);
    }
    onSelect?.(id, opt);
  };

  const handleAgencyChange = (e) => {
    const code = e.target.value;
    const agency = agencies.find((a) => a.code === code) || null;
    setSelectedAgency(agency);
    // Notificar al padre con datos de la agencia
    const opt = options.find((o) => o.id === "correo-branch");
    onSelect?.("correo-branch", opt, agency);
  };

  if (available.length === 0) return null;

  return (
    <div className="shipopt-container">
      {/* ============================
          AVISO IMPORTANTE
      ============================ */}
      <div className="shipopt-aviso">
        <span className="shipopt-aviso-icon">⚠️</span>
        <p>
          <strong>IMPORTANTE:</strong> Correo Argentino NO llama por teléfono. El rango horario de las
          entregas es de 9:00 a 18:00 hs. Las fechas de entrega son <strong>ESTIMADAS</strong>, no
          consideran feriados y/o condiciones climáticas. Las órdenes no pagas se cancelan
          automáticamente a las 48 hs. Si elegiste envío a sucursal: una vez que llega el paquete,
          disponés de <strong>4 días hábiles</strong> para retirarlo.
        </p>
      </div>

      <h4 className="shipopt-title">Opciones de envío de Correo Argentino</h4>

      <div className="shipopt-list">
        {available.map((opt) => {
          const isSelected = selected === opt.id;

          return (
            <div key={opt.id}>
              <div
                className={`shipopt-item${isSelected ? " shipopt-item--selected" : ""}`}
                onClick={() => handleSelect(opt.id, opt)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && handleSelect(opt.id, opt)}
              >
                <div className="shipopt-radio">
                  <span className={`shipopt-dot${isSelected ? " shipopt-dot--active" : ""}`} />
                </div>

                <div className="shipopt-info">
                  <strong className="shipopt-carrier">{opt.type}</strong>

                  <div className="shipopt-row">
                    {freeShipping ? (
                      <p className="shipopt-price" style={{ color: '#2e7d32', fontWeight: 700 }}>
                        GRATIS 🎉
                      </p>
                    ) : (
                      <p className="shipopt-price">
                        ${opt.data.price.toLocaleString("es-AR")}
                      </p>
                    )}
                  </div>

                  {/* Rango de fechas estimadas */}
                  {(() => {
                    const rango = calcRangoEntrega(opt.data.deliveryTimeMin, opt.data.deliveryTimeMax);
                    if (rango) {
                      return <p className="shipopt-fechas">{rango}</p>;
                    }
                    // Fallback: mostrar el eta textual si no hay min/max
                    return opt.data.eta ? <small className="shipopt-eta">{opt.data.eta}</small> : null;
                  })()}
                </div>
              </div>

              {/* Selector de sucursal desplegable */}
              {opt.id === "correo-branch" && isSelected && (
                <div className="shipopt-agency-box">
                  {loadingAgencies ? (
                    <p className="shipopt-agency-loading">Buscando sucursales cercanas...</p>
                  ) : agencies.length > 0 ? (
                    <>
                      <label className="shipopt-agency-label">Elegí una sucursal:</label>
                      <select
                        className="shipopt-agency-select"
                        value={selectedAgency?.code || ""}
                        onChange={handleAgencyChange}
                      >
                        <option value="">Seleccioná una sucursal</option>
                        {agencies.map((a) => (
                          <option key={a.code} value={a.code}>
                            {a.name} — {a.locality} ({a.address})
                          </option>
                        ))}
                      </select>
                      {selectedAgency && (
                        <p className="shipopt-agency-detail">
                          📍 {selectedAgency.address}, {selectedAgency.locality}
                          {selectedAgency.phone && ` · Tel: ${selectedAgency.phone}`}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="shipopt-agency-empty">
                      No se encontraron sucursales para este código postal.
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Aclaración feriados */}
      <p className="shipopt-feriados">
        El tiempo de entrega <strong>no considera feriados</strong>.
      </p>
    </div>
  );
}
