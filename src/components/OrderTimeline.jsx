import "../styles/ordertimeline.css";

export default function OrderTimeline({ status }) {
  const steps = [
    { id: "recibido", label: "Pedido recibido" },
    { id: "preparando", label: "Preparando" },
    { id: "en_camino", label: "En camino" },
    { id: "listo_retirar", label: "Listo para retirar" },
    { id: "entregado", label: "Entregado" },
  ];

  const currentIndex = steps.findIndex((s) => s.id === status);

  return (
    <div className="otl-container">
      {steps.map((step, index) => (
        <div key={step.id} className="otl-step">
          <div
            className={`otl-circle ${index <= currentIndex ? "otl-active" : ""
              }`}
          />
          <span
            className={`otl-label ${index <= currentIndex ? "otl-label-active" : ""
              }`}
          >
            {step.label}
          </span>

          {index < steps.length - 1 && (
            <div
              className={`otl-line ${index < currentIndex ? "otl-line-active" : ""
                }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
