// src/components/ShippingOptions.jsx
import "../styles/shippingoptions.css";

export default function ShippingOptions({ result, selected, onSelect }) {
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

  if (available.length === 0) return null;

  return (
    <div className="shipopt-container">
      <h4 className="shipopt-title">Opciones de envío</h4>

      <div className="shipopt-list">
        {available.map((opt) => {
          const isSelected = selected === opt.id;

          return (
            <div
              key={opt.id}
              className={`shipopt-item${isSelected ? " shipopt-item--selected" : ""}`}
              onClick={() => onSelect?.(opt.id, opt)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && onSelect?.(opt.id, opt)}
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
          );
        })}
      </div>
    </div>
  );
}
