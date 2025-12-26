import { Link } from "react-router-dom";
import "../styles/notfound.css";

export default function NotFound() {
  return (
    <div className="notfound-page">
      <div className="notfound-box">
        <h1 className="notfound-title">404</h1>
        <p className="notfound-subtitle">Página no encontrada</p>

        <p className="notfound-text">
          Uy... parece que este enlace no existe o fue movido.
        </p>

        <div className="notfound-bear">🧸</div>

        <Link to="/" className="notfound-btn">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
