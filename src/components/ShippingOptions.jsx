// src/components/ShippingOptions.jsx

export default function ShippingOptions({ result }) {
  if (!result) return null;

  const { andreani, correo } = result;

  const options = [
    {
      id: "andreani-home",
      carrier: "Andreani",
      type: "Domicilio",
      data: andreani?.home,
    },
    {
      id: "andreani-branch",
      carrier: "Andreani",
      type: "Sucursal",
      data: andreani?.branch,
    },
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
    <div style={{ marginTop: "1rem" }}>
      <h4 style={{ marginBottom: "0.5rem" }}>Opciones de envío</h4>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {options.map((opt) =>
          opt.data?.available ? (
            <div
              key={opt.id}
              style={{
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #ddd",
                background: "#fafafa",
              }}
            >
              <strong>
                {opt.carrier} — {opt.type}
              </strong>
              <p style={{ margin: "4px 0" }}>${opt.data.price}</p>
              <small style={{ color: "#666" }}>{opt.data.eta}</small>
            </div>
          ) : null
        )}
      </div>
    </div>
  );
}
