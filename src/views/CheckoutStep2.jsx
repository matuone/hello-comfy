import { useState, useEffect } from "react";
import { useShippingCalculator } from "../hooks/useShippingCalculator";
import { fetchAgenciesByCP } from "../services/shippingApi";
import SearchableSelect from "../components/SearchableSelect";

const PROVINCIAS_AR = [
  "Buenos Aires", "CABA", "Catamarca", "Chaco", "Chubut", "Córdoba",
  "Corrientes", "Entre Ríos", "Formosa", "Jujuy", "La Pampa", "La Rioja",
  "Mendoza", "Misiones", "Neuquén", "Río Negro", "Salta", "San Juan",
  "San Luis", "Santa Cruz", "Santa Fe", "Santiago del Estero",
  "Tierra del Fuego", "Tucumán",
];

export default function Step2({ formData, updateField, next, back, items }) {
  const needsAddress = formData.shippingMethod === "correo-home" || formData.shippingMethod === "home";
  const needsPostalCode =
    formData.shippingMethod === "correo-home" ||
    formData.shippingMethod === "correo-branch" ||
    formData.shippingMethod === "home";

  // ============================
  // CÁLCULO DE ENVÍO
  // ============================
  const {
    loading: loadingShipping,
    result: shippingResult,
    error: shippingError,
    calcular: calcularEnvio,
  } = useShippingCalculator();

  // Sucursales para correo-branch
  const [agencies, setAgencies] = useState([]);
  const [loadingAgencies, setLoadingAgencies] = useState(false);
  const [initialCalcDone, setInitialCalcDone] = useState(false);

  // Calcular envío cuando el CP es válido y hay items
  const handleCalculateShipping = () => {
    const cp = (formData.postalCode || "").trim();
    if (cp.length < 4 || !items || items.length === 0) return;

    const products = items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      weight: item.weight,
      dimensions: item.dimensions,
    }));

    calcularEnvio(cp, products);
  };

  // Auto-calcular al montar si ya viene con CP precargado del carrito
  useEffect(() => {
    const cp = (formData.postalCode || "").trim();
    if (cp.length >= 4 && items && items.length > 0 && !initialCalcDone) {
      setInitialCalcDone(true);
      handleCalculateShipping();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-calcular cuando cambia el CP (con 4+ dígitos)
  useEffect(() => {
    const cp = (formData.postalCode || "").trim();
    if (cp.length >= 4 && items && items.length > 0) {
      handleCalculateShipping();
    }
  }, [formData.postalCode]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cargar sucursales cuando se selecciona correo-branch y hay CP
  useEffect(() => {
    const cp = (formData.postalCode || "").trim();
    if (formData.shippingMethod === "correo-branch" && cp.length >= 4) {
      setLoadingAgencies(true);
      fetchAgenciesByCP(cp)
        .then((data) => {
          setAgencies(data);
          // Restaurar sucursal guardada si existe
          if (formData.selectedAgency?.code) {
            const match = data.find((a) => a.code === formData.selectedAgency.code);
            if (match) return;
          }
          // Si hay solo una, autoseleccionarla
          if (data.length === 1) {
            updateField("selectedAgency", data[0]);
          }
        })
        .finally(() => setLoadingAgencies(false));
    }
  }, [formData.shippingMethod, formData.postalCode]); // eslint-disable-line react-hooks/exhaustive-deps

  // Guardar el precio de envío en formData cuando cambia el resultado o el método
  useEffect(() => {
    if (!shippingResult?.correo) return;

    const method = formData.shippingMethod;
    if (method === "correo-home" || method === "home") {
      const price = shippingResult.correo.home?.price || 0;
      updateField("shippingPrice", price);
    } else if (method === "correo-branch") {
      const price = shippingResult.correo.branch?.price || 0;
      updateField("shippingPrice", price);
    }
  }, [shippingResult, formData.shippingMethod]); // eslint-disable-line react-hooks/exhaustive-deps

  // Datos del envío para mostrar
  const homeData = shippingResult?.correo?.home;
  const branchData = shippingResult?.correo?.branch;

  // Al cambiar provincia, limpiar localidad
  const handleProvinceChange = (value) => {
    updateField("province", value);
    updateField("localidad", "");
  };

  // Cambiar método de envío y limpiar campos del método anterior
  const handleShippingChange = (method) => {
    updateField("shippingMethod", method);
    if (method === "pickup") {
      updateField("address", "");
      updateField("postalCode", "");
      updateField("province", "");
      updateField("localidad", "");
      updateField("selectedAgency", null);
      updateField("shippingPrice", 0);
    } else {
      updateField("pickPoint", "");
      if (method !== "correo-branch") {
        updateField("selectedAgency", null);
      }
    }
  };

  const handleAgencyChange = (e) => {
    const code = e.target.value;
    const agency = agencies.find((a) => a.code === code) || null;
    updateField("selectedAgency", agency);
  };

  // ============================
  // VALIDACIÓN
  // ============================
  const hasValidAddress =
    (formData.address || "").trim().length > 3 &&
    (formData.postalCode || "").trim().length >= 4 &&
    (formData.province || "").trim().length > 2 &&
    (formData.localidad || "").trim().length > 2;

  const hasValidBranch =
    (formData.postalCode || "").trim().length >= 4 &&
    (formData.province || "").trim().length > 2 &&
    (formData.localidad || "").trim().length > 2 &&
    formData.selectedAgency !== null;

  const hasShippingPrice = (formData.shippingPrice || 0) > 0;

  const isValid =
    (formData.shippingMethod === "pickup" && (formData.pickPoint || "").trim().length > 0) ||
    (needsAddress && hasValidAddress && hasShippingPrice) ||
    (formData.shippingMethod === "correo-branch" && hasValidBranch && hasShippingPrice);

  return (
    <div className="checkout-step">
      <h2>Dirección de envío</h2>

      {/* ============================
          MÉTODO DE ENVÍO
      ============================ */}
      <h3>Método de envío</h3>

      <div className="shipping-options">
        {/* ⭐ PICK UP POINT */}
        <label>
          <input
            type="radio"
            name="shipping"
            checked={formData.shippingMethod === "pickup"}
            onChange={() => handleShippingChange("pickup")}
          />
          Retiro en Pick Up Point
        </label>

        {/* ⭐ ENVÍO A DOMICILIO — Correo Argentino */}
        <label>
          <input
            type="radio"
            name="shipping"
            checked={formData.shippingMethod === "correo-home" || formData.shippingMethod === "home"}
            onChange={() => handleShippingChange("correo-home")}
          />
          Envío a domicilio (Correo Argentino)
          {homeData?.available && (formData.shippingMethod === "correo-home" || formData.shippingMethod === "home") && (
            <span className="checkout-shipping-price">
              — ${homeData.price.toLocaleString("es-AR")} · {homeData.eta}
            </span>
          )}
        </label>

        {/* ⭐ ENVÍO A SUCURSAL — Correo Argentino */}
        <label>
          <input
            type="radio"
            name="shipping"
            checked={formData.shippingMethod === "correo-branch"}
            onChange={() => handleShippingChange("correo-branch")}
          />
          Envío a sucursal (Correo Argentino)
          {branchData?.available && formData.shippingMethod === "correo-branch" && (
            <span className="checkout-shipping-price">
              — ${branchData.price.toLocaleString("es-AR")} · {branchData.eta}
            </span>
          )}
        </label>
      </div>

      {/* Indicador de carga de envío */}
      {loadingShipping && needsPostalCode && (
        <p className="checkout-shipping-loading">Calculando costo de envío...</p>
      )}

      {shippingError && needsPostalCode && (
        <p className="checkout-shipping-error">{shippingError}</p>
      )}

      {/* ============================
          PICK UP POINT SELECTOR
      ============================ */}
      {formData.shippingMethod === "pickup" && (
        <div className="checkout-pickup-box">
          <h4 className="checkout-pickup-title">Elegí tu punto de retiro</h4>

          <select
            className="checkout-pickup-select"
            value={formData.pickPoint || ""}
            onChange={(e) => updateField("pickPoint", e.target.value)}
          >
            <option value="">Seleccioná un punto</option>
            <option value="aquelarre">Pick Up Point Aquelarre - CABA</option>
            <option value="temperley">Pick Up Point Temperley - ZS-GBA</option>
          </select>

          {formData.pickPoint === "aquelarre" && (
            <div
              className="pd-secondary-text"
              style={{ marginTop: "8px", lineHeight: "1.5", background: "#fff7fb", border: "1px solid #f3c3d2", borderRadius: "10px", padding: "10px 12px" }}
            >
              <p style={{ margin: 0, fontWeight: 700 }}>Aquelarre Showroom</p>
              <p style={{ margin: "4px 0 0 0" }}>Lavalle 2086, CABA. Gratis.</p>
              <p style={{ margin: "4px 0 0 0" }}>Lunes a domingos de 10:00 a 19:00.</p>
              <p style={{ margin: "6px 0 0 0" }}>Los pedidos tardan entre 24-48 hs habiles en estar listos.</p>
              <p style={{ margin: "6px 0 0 0", fontWeight: 600 }}>No concurrir sin haber recibido confirmacion de retiro.</p>
            </div>
          )}

          {formData.pickPoint === "temperley" && (
            <div
              className="pd-secondary-text"
              style={{ marginTop: "8px", lineHeight: "1.5", background: "#fff7fb", border: "1px solid #f3c3d2", borderRadius: "10px", padding: "10px 12px" }}
            >
              <p style={{ margin: 0, fontWeight: 700 }}>Pick Up Point Temperley</p>
              <p style={{ margin: "4px 0 0 0" }}>Avenida Almirante Brown al 4300, con cita previa.</p>
              <p style={{ margin: "4px 0 0 0" }}>Lunes a viernes de 15:00 a 19:00.</p>
              <p style={{ margin: "6px 0 0 0" }}>Una vez realizada la compra se enviara la direccion exacta.</p>
            </div>
          )}

          <p className="pd-secondary-text" style={{ marginTop: "4px" }}>
            Retiro sin costo. Te avisamos cuando esté listo.
          </p>
        </div>
      )}

      {/* ============================
          CAMPOS DE DIRECCIÓN (correo-home y correo-branch)
      ============================ */}
      {formData.shippingMethod !== "pickup" && formData.shippingMethod && (
        <>
          {/* Dirección solo para envío a domicilio */}
          {needsAddress && (
            <div className="form-group">
              <label>Dirección</label>
              <input
                type="text"
                placeholder="Ej: Av. Siempreviva 742"
                value={formData.address}
                onChange={(e) => updateField("address", e.target.value)}
              />
              <p className="pd-secondary-text" style={{ marginTop: "6px", color: "#e75480" }}>
                Recordá incluir la altura/número de la dirección.
              </p>
            </div>
          )}

          <div className="form-group">
            <label>Código postal</label>
            <input
              type="text"
              placeholder="Ej: 1834"
              value={formData.postalCode}
              onChange={(e) => updateField("postalCode", e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Provincia</label>
            <SearchableSelect
              options={PROVINCIAS_AR}
              value={formData.province || ""}
              onChange={handleProvinceChange}
              placeholder="Seleccioná una provincia"
            />
          </div>

          <div className="form-group">
            <label>Localidad</label>
            <input
              type="text"
              placeholder="Ej: Temperley, La Plata, Palermo..."
              value={formData.localidad || ""}
              onChange={(e) => updateField("localidad", e.target.value)}
            />
          </div>
        </>
      )}

      {/* ============================
          SELECTOR DE SUCURSAL (correo-branch)
      ============================ */}
      {formData.shippingMethod === "correo-branch" &&
        (formData.postalCode || "").trim().length >= 4 && (
          <div className="checkout-agency-box">
            <h4 className="checkout-agency-title">Elegí una sucursal</h4>

            {loadingAgencies ? (
              <p className="checkout-agency-loading">Buscando sucursales cercanas...</p>
            ) : agencies.length > 0 ? (
              <>
                <select
                  className="checkout-agency-select"
                  value={formData.selectedAgency?.code || ""}
                  onChange={handleAgencyChange}
                >
                  <option value="">Seleccioná una sucursal</option>
                  {agencies.map((a) => (
                    <option key={a.code} value={a.code}>
                      {a.name} — {a.locality} ({a.address})
                    </option>
                  ))}
                </select>

                {formData.selectedAgency && (
                  <p className="checkout-agency-detail">
                    📍 {formData.selectedAgency.address}, {formData.selectedAgency.locality}
                    {formData.selectedAgency.phone && ` · Tel: ${formData.selectedAgency.phone}`}
                  </p>
                )}
              </>
            ) : (
              <p className="checkout-agency-empty">
                No se encontraron sucursales para este código postal.
              </p>
            )}
          </div>
        )}

      {/* ============================
          BOTONES
      ============================ */}
      <div className="checkout-nav">
        <button className="checkout-btn-secondary" onClick={back}>
          Volver
        </button>

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
    </div>
  );
}
