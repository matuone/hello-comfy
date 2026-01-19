import "../styles/maintenance.css";
import maintenanceImg from "../assets/mantenimiento.png";

export default function Maintenance() {
  return (
    <div className="maintenance-container">
      <div className="maintenance-content">
        <div className="maintenance-image-wrapper">
          <img
            src={maintenanceImg}
            alt="Osito en construcción"
            className="maintenance-bear-img"
          />
        </div>

        <div className="maintenance-message">
          <h1>Estamos trabajando para que tengas una mejor experiencia</h1>
          <p>En unos momentos volveremos.</p>

          <div className="maintenance-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    </div>
  );
}
