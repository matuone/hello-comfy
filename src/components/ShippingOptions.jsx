// src/components/ShippingOptions.jsx
import "../styles/shippingoptions.css";

export default function ShippingOptions({ result }) {
  if (!result) return null;

  const { correo } = result;

  const options = [
    {
      id: "correo-home",
      carrier: "Correo Argentino",
      type: "Domicilio",
      data: correo?.home,
    },
    {
      id: "correo-branch",
      carrier: "Correo Argentino",
      type: "Sucursal",
      data: correo?.branch,
    },
  ];

  return (
    <div className="shipopt-container">
      <h4 className="shipopt-title">Opciones de envío</h4>

      <div className="shipopt-list">
        {options.map((opt) =>
          opt.data?.available ? (
            <div key={opt.id} className="shipopt-item">
              <strong className="shipopt-carrier">
                {opt.carrier} — {opt.type}
              </strong>

              <p className="shipopt-price">
                ${opt.data.price.toLocaleString("es-AR")}
              </p>

              <small className="shipopt-eta">{opt.data.eta}</small>
            </div>
          ) : null
        )}
      </div>
    </div>
  );
}
