// src/components/ShippingOptions.jsx
import { useState, useEffect } from "react";
import { fetchAgenciesByCP } from "../services/shippingApi";
import "../styles/shippingoptions.css";

export default function ShippingOptions({ result, selected, onSelect, postalCode, initialAgency }) {
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
                    <p className="shipopt-price">
                      ${opt.data.price.toLocaleString("es-AR")}
                    </p>
                    <small className="shipopt-eta">{opt.data.eta}</small>
                  </div>
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
    </div>
  );
}
